import os
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import jwt
import razorpay

from db import get_db_connection


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "happy-with-healthy-change-this-secret"
)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


razorpay_client = None

if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )


products_bp = Blueprint("products", __name__)


# ============================================================
# CUSTOMER AUTHENTICATION
# ============================================================

def get_authenticated_customer():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if payload.get("role") != "customer":
            return None

        return payload.get("customer_id")

    except jwt.InvalidTokenError:
        return None


# ============================================================
# ADMIN AUTHENTICATION
# ============================================================

def get_authenticated_admin():
    if request.method == "OPTIONS":
        return True

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return False

    token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return False

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if payload.get("role") != "admin":
            return False

        return True

    except jwt.InvalidTokenError:
        return False


# ============================================================
# ADMIN LOGIN
# ============================================================

@products_bp.route("/api/admin/login", methods=["POST"])
def login_admin():

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    admin_email = os.getenv(
        "ADMIN_EMAIL",
        ""
    ).strip().lower()

    admin_password_hash = os.getenv(
        "ADMIN_PASSWORD_HASH",
        ""
    )

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    if not admin_email or not admin_password_hash:
        return jsonify({
            "error": "Admin credentials are not configured"
        }), 503

    if (
        email != admin_email
        or not check_password_hash(
            admin_password_hash,
            password
        )
    ):
        return jsonify({
            "error": "Invalid admin credentials"
        }), 401

    token = jwt.encode(
        {
            "role": "admin",
            "admin_email": admin_email
        },
        JWT_SECRET,
        algorithm="HS256"
    )

    return jsonify({
        "message": "Admin login successful",
        "token": token
    }), 200


# ============================================================
# CUSTOMER REGISTRATION
# ============================================================

@products_bp.route("/api/customers/register", methods=["POST"])
def register_customer():

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    address = data.get("address", "").strip()

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    if len(password) < 6:
        return jsonify({
            "error": "Password must be at least 6 characters"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM customers
            WHERE email = %s
            """,
            (email,)
        )

        existing_customer = cursor.fetchone()

        if existing_customer:
            return jsonify({
                "error": "An account with this email already exists"
            }), 409

        password_hash = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO customers
            (name, email, phone, password_hash, address)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                name,
                email,
                phone,
                password_hash,
                address
            )
        )

        db.commit()

        customer_id = cursor.lastrowid

        return jsonify({
            "message": "Customer registered successfully",
            "customer": {
                "id": customer_id,
                "name": name,
                "email": email,
                "phone": phone,
                "address": address
            }
        }), 201

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CUSTOMER LOGIN
# ============================================================

@products_bp.route("/api/customers/login", methods=["POST"])
def login_customer():

    data = request.get_json() or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                password_hash,
                address
            FROM customers
            WHERE email = %s
            """,
            (email,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        if not check_password_hash(
            customer["password_hash"],
            password
        ):
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        token = jwt.encode(
            {
                "customer_id": customer["id"],
                "role": "customer"
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "customer": {
                "id": customer["id"],
                "name": customer["name"],
                "email": customer["email"],
                "phone": customer["phone"],
                "address": customer["address"]
            }
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET CUSTOMER PROFILE
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>",
    methods=["GET"]
)
def get_customer_profile(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                address,
                created_at
            FROM customers
            WHERE id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Customer not found"
            }), 404

        return jsonify(customer), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# UPDATE CUSTOMER PROFILE
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>",
    methods=["PUT"]
)
def update_customer_profile(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    address = data.get("address", "").strip()

    if not name:
        return jsonify({
            "error": "Name is required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM customers
            WHERE id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Customer not found"
            }), 404

        cursor.execute(
            """
            UPDATE customers
            SET
                name = %s,
                phone = %s,
                address = %s
            WHERE id = %s
            """,
            (
                name,
                phone,
                address,
                customer_id
            )
        )

        db.commit()

        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                address,
                created_at
            FROM customers
            WHERE id = %s
            """,
            (customer_id,)
        )

        updated_customer = cursor.fetchone()

        return jsonify({
            "message": "Profile updated successfully",
            "customer": updated_customer
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET PRODUCTS
# ============================================================

@products_bp.route("/api/products", methods=["GET"])
def get_products():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                category,
                price,
                image_url,
                is_available
            FROM products
            WHERE is_available = TRUE
            ORDER BY id DESC
            """
        )

        products = cursor.fetchall()

        return jsonify(products), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CREATE ORDER
# ============================================================

@products_bp.route("/api/orders", methods=["POST"])
def create_order():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    customer_id = authenticated_customer_id
    customer_name = data.get("customer_name", "").strip()
    phone = data.get("phone", "").strip()
    address = data.get("address", "").strip()
    items = data.get("items", [])
    coupon_code = data.get("coupon_code")

    if coupon_code:
        coupon_code = coupon_code.strip().upper()

    if not customer_name or not phone or not address or not items:
        return jsonify({
            "error": "Customer details and cart items are required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        # --------------------------------
        # 1. Calculate subtotal from DB
        # --------------------------------

        subtotal = 0
        order_items = []

        for item in items:

            product_id = item.get("product_id")

            try:
                quantity = int(item.get("quantity", 0))
            except (TypeError, ValueError):
                quantity = 0

            if not product_id or quantity <= 0:
                return jsonify({
                    "error": "Invalid product or quantity"
                }), 400

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    price
                FROM products
                WHERE id = %s
                AND is_available = TRUE
                """,
                (product_id,)
            )

            product = cursor.fetchone()

            if not product:
                return jsonify({
                    "error": f"Product {product_id} is not available"
                }), 400

            item_total = float(product["price"]) * quantity

            subtotal += item_total

            order_items.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": quantity,
                "price": float(product["price"])
            })

        # --------------------------------
        # 2. Validate coupon
        # --------------------------------

        discount = 0
        validated_coupon_code = None

        if coupon_code:

            cursor.execute(
                """
                SELECT
                    id,
                    code,
                    description,
                    discount_type,
                    discount_value,
                    min_order_amount,
                    max_discount,
                    usage_limit,
                    used_count,
                    expires_at,
                    is_active
                FROM coupons
                WHERE code = %s
                """,
                (coupon_code,)
            )

            coupon = cursor.fetchone()

            if not coupon:
                return jsonify({
                    "error": "Invalid coupon code"
                }), 400

            if not coupon["is_active"]:
                return jsonify({
                    "error": "This coupon is no longer active"
                }), 400

            if (
                coupon["expires_at"]
                and coupon["expires_at"] < datetime.now()
            ):
                return jsonify({
                    "error": "This coupon has expired"
                }), 400

            if (
                coupon["usage_limit"] is not None
                and coupon["used_count"] >= coupon["usage_limit"]
            ):
                return jsonify({
                    "error": "This coupon usage limit has been reached"
                }), 400

            if subtotal < float(coupon["min_order_amount"]):
                return jsonify({
                    "error": (
                        f"Minimum order amount is "
                        f"₹{float(coupon['min_order_amount']):.0f}"
                    )
                }), 400

            if coupon["discount_type"] == "PERCENTAGE":

                discount = subtotal * (
                    float(coupon["discount_value"]) / 100
                )

            else:

                discount = float(coupon["discount_value"])

            if coupon["max_discount"] is not None:
                discount = min(
                    discount,
                    float(coupon["max_discount"])
                )

            discount = min(
                discount,
                subtotal
            )

            validated_coupon_code = coupon["code"]

        # --------------------------------
        # 3. Calculate total
        # --------------------------------

        delivery_fee = 49

        final_subtotal = subtotal - discount

        total_amount = final_subtotal + delivery_fee

        # --------------------------------
        # 4. Save order
        # --------------------------------

        cursor.execute(
            """
            INSERT INTO orders
            (
                customer_id,
                customer_name,
                phone,
                address,
                total_amount,
                coupon_code,
                discount_amount
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                customer_id,
                customer_name,
                phone,
                address,
                total_amount,
                validated_coupon_code,
                discount
            )
        )

        order_id = cursor.lastrowid

        # --------------------------------
        # 5. Save order items
        # --------------------------------

        for item in order_items:

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    product_name,
                    quantity,
                    price
                )
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["product_id"],
                    item["product_name"],
                    item["quantity"],
                    item["price"]
                )
            )

        db.commit()

        return jsonify({
            "message": "Order created successfully",
            "order_id": order_id,
            "subtotal": round(subtotal, 2),
            "discount": round(discount, 2),
            "delivery_fee": round(delivery_fee, 2),
            "total_amount": round(total_amount, 2),
            "coupon_code": validated_coupon_code,
            "payment_status": "PENDING"
        }), 201

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CREATE RAZORPAY PAYMENT ORDER
# ============================================================

@products_bp.route("/api/payment/create", methods=["POST"])
def create_payment():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    if razorpay_client is None:
        return jsonify({
            "error": "Razorpay credentials are not configured yet"
        }), 503

    data = request.get_json() or {}

    order_id = data.get("order_id")

    if not order_id:
        return jsonify({
            "error": "Order ID is required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                total_amount,
                payment_status
            FROM orders
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                order_id,
                authenticated_customer_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "error": "Order not found or unauthorized"
            }), 404

        if order["payment_status"] == "PAID":
            return jsonify({
                "error": "Order is already paid"
            }), 400

        amount = float(order["total_amount"])

        razorpay_order = razorpay_client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "receipt": f"happy_order_{order_id}"
        })

        cursor.execute(
            """
            UPDATE orders
            SET razorpay_order_id = %s
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                razorpay_order["id"],
                order_id,
                authenticated_customer_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Razorpay order created successfully",
            "order_id": order_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": RAZORPAY_KEY_ID
        }), 201

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# VERIFY RAZORPAY PAYMENT
# ============================================================

@products_bp.route("/api/payment/verify", methods=["POST"])
def verify_payment():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    if razorpay_client is None:
        return jsonify({
            "error": "Razorpay credentials are not configured yet"
        }), 503

    data = request.get_json() or {}

    order_id = data.get("order_id")
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    if not all([
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    ]):
        return jsonify({
            "error": "Payment verification details are required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        # ---------------------------------------------
        # 1. Get order and verify ownership
        # ---------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                razorpay_order_id,
                payment_status,
                coupon_code
            FROM orders
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                order_id,
                authenticated_customer_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "error": "Order not found or unauthorized"
            }), 404

        if order["payment_status"] == "PAID":
            return jsonify({
                "message": "Payment is already verified",
                "order_id": order_id,
                "payment_status": "PAID"
            }), 200

        if order["razorpay_order_id"] != razorpay_order_id:
            return jsonify({
                "error": "Razorpay order ID does not match"
            }), 400

        # ---------------------------------------------
        # 2. Verify Razorpay signature
        # ---------------------------------------------

        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })

        # ---------------------------------------------
        # 3. Mark order as PAID
        # ---------------------------------------------

        cursor.execute(
            """
            UPDATE orders
            SET
                payment_status = 'PAID',
                razorpay_payment_id = %s
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                razorpay_payment_id,
                order_id,
                authenticated_customer_id
            )
        )

        # ---------------------------------------------
        # 4. Increase coupon usage
        # ---------------------------------------------

        if order["coupon_code"]:

            cursor.execute(
                """
                UPDATE coupons
                SET used_count = used_count + 1
                WHERE code = %s
                AND is_active = TRUE
                AND (
                    usage_limit IS NULL
                    OR used_count < usage_limit
                )
                """,
                (order["coupon_code"],)
            )

            if cursor.rowcount == 0:

                db.rollback()

                return jsonify({
                    "error": "Coupon is no longer available"
                }), 400

        # ---------------------------------------------
        # 5. Save everything
        # ---------------------------------------------

        db.commit()

        return jsonify({
            "message": "Payment verified successfully",
            "order_id": order_id,
            "payment_status": "PAID"
        }), 200

    except razorpay.errors.SignatureVerificationError:

        db.rollback()

        return jsonify({
            "error": "Payment signature verification failed"
        }), 400

    except Exception as error:

        db.rollback()

        print(
            "Payment verification error:",
            error
        )

        return jsonify({
            "error": "Payment verification failed"
        }), 400

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET SINGLE ORDER
# ============================================================

@products_bp.route(
    "/api/orders/<int:order_id>",
    methods=["GET"]
)
def get_order(order_id):

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                customer_name,
                phone,
                address,
                total_amount,
                payment_status,
                order_status,
                created_at
            FROM orders
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                order_id,
                authenticated_customer_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "error": "Order not found"
            }), 404

        # Paid orders ARE allowed to be viewed/tracked.

        cursor.execute(
            """
            SELECT
                id,
                product_id,
                product_name,
                quantity,
                price
            FROM order_items
            WHERE order_id = %s
            ORDER BY id ASC
            """,
            (order_id,)
        )

        items = cursor.fetchall()

        order["items"] = items

        return jsonify(order), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET CUSTOMER ORDERS
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>/orders",
    methods=["GET"]
)
def get_customer_orders(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                customer_name,
                phone,
                address,
                total_amount,
                payment_status,
                order_status,
                created_at
            FROM orders
            WHERE customer_id = %s
            ORDER BY created_at DESC
            """,
            (customer_id,)
        )

        orders = cursor.fetchall()

        return jsonify(orders), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET ALL ORDERS - ADMIN
# ============================================================

@products_bp.route(
    "/api/orders",
    methods=["GET"]
)
def get_orders():

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                customer_name,
                phone,
                address,
                total_amount,
                payment_status,
                order_status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            """
        )

        orders = cursor.fetchall()

        return jsonify(orders), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# UPDATE ORDER STATUS - ADMIN
# ============================================================

@products_bp.route(
    "/api/orders/<int:order_id>/status",
    methods=["PUT"]
)
def update_order_status(order_id):

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    new_status = data.get("order_status")

    allowed_statuses = [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ]

    if new_status not in allowed_statuses:
        return jsonify({
            "error": "Invalid order status"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM orders
            WHERE id = %s
            """,
            (order_id,)
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "error": "Order not found"
            }), 404

        cursor.execute(
            """
            UPDATE orders
            SET order_status = %s
            WHERE id = %s
            """,
            (
                new_status,
                order_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Order status updated successfully",
            "order_id": order_id,
            "order_status": new_status
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CREATE PRODUCT - ADMIN
# ============================================================

@products_bp.route(
    "/api/products",
    methods=["POST"]
)
def create_product():

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    name = data.get("name")
    description = data.get("description", "")
    category = data.get("category")
    price = data.get("price")
    image_url = data.get("image_url", "")
    is_available = data.get("is_available", True)

    if not name or not category or price is None:
        return jsonify({
            "error": "Name, category and price are required"
        }), 400

    try:

        price = float(price)

        if price < 0:
            return jsonify({
                "error": "Price cannot be negative"
            }), 400

    except (TypeError, ValueError):

        return jsonify({
            "error": "Invalid price"
        }), 400

    db = get_db_connection()
    cursor = db.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO products
            (
                name,
                description,
                category,
                price,
                image_url,
                is_available
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                name,
                description,
                category,
                price,
                image_url,
                is_available
            )
        )

        db.commit()

        product_id = cursor.lastrowid

        return jsonify({
            "message": "Product created successfully",
            "product_id": product_id
        }), 201

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# UPDATE PRODUCT - ADMIN
# ============================================================

@products_bp.route(
    "/api/products/<int:product_id>",
    methods=["PUT"]
)
def update_product(product_id):

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    name = data.get("name")
    description = data.get("description", "")
    category = data.get("category")
    price = data.get("price")
    image_url = data.get("image_url", "")
    is_available = data.get("is_available", True)

    if not name or not category or price is None:
        return jsonify({
            "error": "Name, category and price are required"
        }), 400

    try:

        price = float(price)

        if price < 0:
            return jsonify({
                "error": "Price cannot be negative"
            }), 400

    except (TypeError, ValueError):

        return jsonify({
            "error": "Invalid price"
        }), 400

    db = get_db_connection()
    cursor = db.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "error": "Product not found"
            }), 404

        cursor.execute(
            """
            UPDATE products
            SET
                name = %s,
                description = %s,
                category = %s,
                price = %s,
                image_url = %s,
                is_available = %s
            WHERE id = %s
            """,
            (
                name,
                description,
                category,
                price,
                image_url,
                is_available,
                product_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Product updated successfully",
            "product_id": product_id
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# DELETE PRODUCT - ADMIN
# ============================================================

@products_bp.route(
    "/api/products/<int:product_id>",
    methods=["DELETE"]
)
def delete_product(product_id):

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "error": "Product not found"
            }), 404

        cursor.execute(
            """
            DELETE FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        db.commit()

        return jsonify({
            "message": "Product deleted successfully",
            "product_id": product_id
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CREATE SUBSCRIPTION
# ============================================================

@products_bp.route(
    "/api/subscriptions",
    methods=["POST"]
)
def create_subscription():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        data = request.get_json() or {}

        customer_id = authenticated_customer_id
        plan_name = data.get("plan_name")
        plan_price = data.get("plan_price")
        duration_days = data.get("duration_days", 30)
        start_date = data.get("start_date")
        delivery_address = data.get("delivery_address")

        if not all([
            plan_name,
            plan_price,
            start_date,
            delivery_address
        ]):
            return jsonify({
                "error": "All subscription details are required."
            }), 400

        start = datetime.strptime(
            start_date,
            "%Y-%m-%d"
        ).date()

        end_date = start + timedelta(
            days=int(duration_days) - 1
        )

        cursor.execute(
            """
            SELECT id
            FROM customers
            WHERE id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Customer not found."
            }), 404

        cursor.execute(
            """
            INSERT INTO subscriptions (
                customer_id,
                plan_name,
                plan_price,
                duration_days,
                start_date,
                end_date,
                delivery_address,
                payment_status,
                subscription_status
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, 'PENDING', 'PENDING'
            )
            """,
            (
                customer_id,
                plan_name,
                plan_price,
                duration_days,
                start,
                end_date,
                delivery_address
            )
        )

        db.commit()

        subscription_id = cursor.lastrowid

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                plan_name,
                plan_price,
                duration_days,
                start_date,
                end_date,
                delivery_address,
                payment_status,
                subscription_status,
                created_at
            FROM subscriptions
            WHERE id = %s
            """,
            (subscription_id,)
        )

        subscription = cursor.fetchone()

        return jsonify(subscription), 201

    except ValueError:

        return jsonify({
            "error": "Invalid start date. Use YYYY-MM-DD."
        }), 400

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CREATE SUBSCRIPTION RAZORPAY PAYMENT
# ============================================================

@products_bp.route(
    "/api/subscriptions/payment/create",
    methods=["POST"]
)
def create_subscription_payment():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        data = request.get_json() or {}

        subscription_id = data.get("subscription_id")

        if not subscription_id:
            return jsonify({
                "error": "Subscription ID is required."
            }), 400

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                plan_name,
                plan_price,
                payment_status
            FROM subscriptions
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                subscription_id,
                authenticated_customer_id
            )
        )

        subscription = cursor.fetchone()

        if not subscription:
            return jsonify({
                "error": "Subscription not found or unauthorized."
            }), 404

        if subscription["payment_status"] == "PAID":
            return jsonify({
                "error": "Subscription is already paid."
            }), 400

        razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")

        if not razorpay_key_id or not razorpay_key_secret:
            return jsonify({
                "error": "Razorpay credentials are not configured yet."
            }), 503

        client = razorpay.Client(
            auth=(
                razorpay_key_id,
                razorpay_key_secret
            )
        )

        amount = int(
            float(subscription["plan_price"]) * 100
        )

        razorpay_order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": f"subscription_{subscription_id}",
            "notes": {
                "subscription_id": str(subscription_id),
                "plan_name": subscription["plan_name"]
            }
        })

        cursor.execute(
            """
            UPDATE subscriptions
            SET razorpay_order_id = %s
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                razorpay_order["id"],
                subscription_id,
                authenticated_customer_id
            )
        )

        db.commit()

        return jsonify({
            "subscription_id": subscription_id,
            "razorpay_order_id": razorpay_order["id"],
            "amount": amount,
            "currency": "INR",
            "key_id": razorpay_key_id
        }), 201

    except Exception as error:

        db.rollback()

        print(
            "Subscription Razorpay error:",
            error
        )

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# VERIFY SUBSCRIPTION PAYMENT
# ============================================================

@products_bp.route(
    "/api/subscriptions/payment/verify",
    methods=["POST"]
)
def verify_subscription_payment():

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        data = request.get_json() or {}

        subscription_id = data.get("subscription_id")
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not all([
            subscription_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        ]):
            return jsonify({
                "error": "Payment verification details are incomplete."
            }), 400

        razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")

        if not razorpay_key_id or not razorpay_key_secret:
            return jsonify({
                "error": "Razorpay credentials are not configured yet."
            }), 503

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                razorpay_order_id,
                payment_status
            FROM subscriptions
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                subscription_id,
                authenticated_customer_id
            )
        )

        subscription = cursor.fetchone()

        if not subscription:
            return jsonify({
                "error": "Subscription not found or unauthorized."
            }), 404

        if subscription["payment_status"] == "PAID":
            return jsonify({
                "message": "Subscription payment is already verified.",
                "subscription_id": subscription_id
            }), 200

        if subscription["razorpay_order_id"] != razorpay_order_id:
            return jsonify({
                "error": "Razorpay order does not match this subscription."
            }), 400

        client = razorpay.Client(
            auth=(
                razorpay_key_id,
                razorpay_key_secret
            )
        )

        client.utility.verify_payment_signature({
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature
        })

        cursor.execute(
            """
            UPDATE subscriptions
            SET
                payment_status = 'PAID',
                subscription_status = 'ACTIVE',
                razorpay_payment_id = %s
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                razorpay_payment_id,
                subscription_id,
                authenticated_customer_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Subscription payment verified successfully.",
            "subscription_id": subscription_id,
            "payment_status": "PAID",
            "subscription_status": "ACTIVE"
        }), 200

    except razorpay.errors.SignatureVerificationError:

        db.rollback()

        return jsonify({
            "error": "Payment signature verification failed."
        }), 400

    except Exception as error:

        db.rollback()

        print(
            "Subscription payment verification error:",
            error
        )

        return jsonify({
            "error": "Subscription payment verification failed."
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET CUSTOMER SUBSCRIPTIONS
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>/subscriptions",
    methods=["GET"]
)
def get_customer_subscriptions(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                plan_name,
                plan_price,
                duration_days,
                start_date,
                end_date,
                delivery_address,
                payment_status,
                subscription_status,
                razorpay_order_id,
                razorpay_payment_id,
                created_at
            FROM subscriptions
            WHERE customer_id = %s
            ORDER BY created_at DESC
            """,
            (customer_id,)
        )

        subscriptions = cursor.fetchall()

        return jsonify(subscriptions), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# CANCEL SUBSCRIPTION
# ============================================================

@products_bp.route(
    "/api/subscriptions/<int:subscription_id>/cancel",
    methods=["PUT"]
)
def cancel_subscription(subscription_id):

    authenticated_customer_id = get_authenticated_customer()

    if not authenticated_customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                customer_id,
                subscription_status
            FROM subscriptions
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                subscription_id,
                authenticated_customer_id
            )
        )

        subscription = cursor.fetchone()

        if not subscription:
            return jsonify({
                "error": "Subscription not found or unauthorized."
            }), 404

        if subscription["subscription_status"] == "CANCELLED":
            return jsonify({
                "error": "Subscription is already cancelled."
            }), 400

        if subscription["subscription_status"] not in [
            "PENDING",
            "ACTIVE"
        ]:
            return jsonify({
                "error": "This subscription cannot be cancelled."
            }), 400

        cursor.execute(
            """
            UPDATE subscriptions
            SET subscription_status = 'CANCELLED'
            WHERE id = %s
            AND customer_id = %s
            """,
            (
                subscription_id,
                authenticated_customer_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Subscription cancelled successfully.",
            "subscription_id": subscription_id,
            "subscription_status": "CANCELLED"
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET ALL CUSTOMERS - ADMIN
# ============================================================

@products_bp.route(
    "/api/admin/customers",
    methods=["GET"]
)
def get_all_customers():

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                c.id,
                c.name,
                c.email,
                c.phone,
                c.address,
                c.created_at,
                COUNT(DISTINCT o.id) AS order_count,
                COUNT(DISTINCT s.id) AS subscription_count
            FROM customers c
            LEFT JOIN orders o
                ON c.id = o.customer_id
            LEFT JOIN subscriptions s
                ON c.id = s.customer_id
            GROUP BY
                c.id,
                c.name,
                c.email,
                c.phone,
                c.address,
                c.created_at
            ORDER BY c.created_at DESC
            """
        )

        customers = cursor.fetchall()

        return jsonify(customers), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET ALL SUBSCRIPTIONS - ADMIN
# ============================================================

@products_bp.route(
    "/api/admin/subscriptions",
    methods=["GET"]
)
def get_all_subscriptions():

    if not get_authenticated_admin():
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                s.id,
                s.customer_id,
                c.name AS customer_name,
                c.email,
                c.phone,
                s.plan_name,
                s.plan_price,
                s.duration_days,
                s.start_date,
                s.end_date,
                s.delivery_address,
                s.payment_status,
                s.subscription_status,
                s.created_at
            FROM subscriptions s
            LEFT JOIN customers c
                ON s.customer_id = c.id
            ORDER BY s.created_at DESC
            """
        )

        subscriptions = cursor.fetchall()

        return jsonify(subscriptions), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# GET CUSTOMER FAVORITES
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>/favorites",
    methods=["GET"]
)
def get_customer_favorites(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                p.id,
                p.name,
                p.category,
                p.description,
                p.price,
                p.image_url,
                p.is_available
            FROM favorites f
            JOIN products p
                ON f.product_id = p.id
            WHERE f.customer_id = %s
            ORDER BY f.created_at DESC
            """,
            (customer_id,)
        )

        favorites = cursor.fetchall()

        return jsonify(favorites), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# ADD FAVORITE
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>/favorites",
    methods=["POST"]
)
def add_favorite(customer_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    data = request.get_json() or {}

    product_id = data.get("product_id")

    if not product_id:
        return jsonify({
            "error": "Product ID is required."
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM customers
            WHERE id = %s
            """,
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Customer not found."
            }), 404

        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,)
        )

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "error": "Product not found."
            }), 404

        cursor.execute(
            """
            INSERT IGNORE INTO favorites (
                customer_id,
                product_id
            )
            VALUES (%s, %s)
            """,
            (
                customer_id,
                product_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Product added to favorites."
        }), 201

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# REMOVE FAVORITE
# ============================================================

@products_bp.route(
    "/api/customers/<int:customer_id>/favorites/<int:product_id>",
    methods=["DELETE"]
)
def remove_favorite(customer_id, product_id):

    authenticated_customer_id = get_authenticated_customer()

    if authenticated_customer_id != customer_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    db = get_db_connection()
    cursor = db.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM favorites
            WHERE customer_id = %s
            AND product_id = %s
            """,
            (
                customer_id,
                product_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Product removed from favorites."
        }), 200

    except Exception as error:

        db.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# ============================================================
# VALIDATE COUPON
# ============================================================

@products_bp.route(
    "/api/coupons/validate",
    methods=["POST"]
)
def validate_coupon():

    data = request.get_json() or {}

    code = data.get(
        "code",
        ""
    ).strip().upper()

    try:
        subtotal = float(
            data.get(
                "subtotal",
                0
            )
        )
    except (TypeError, ValueError):

        return jsonify({
            "error": "Invalid subtotal"
        }), 400

    if not code:
        return jsonify({
            "error": "Coupon code is required"
        }), 400

    if subtotal < 0:
        return jsonify({
            "error": "Invalid subtotal"
        }), 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                code,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount,
                usage_limit,
                used_count,
                expires_at,
                is_active
            FROM coupons
            WHERE code = %s
            """,
            (code,)
        )

        coupon = cursor.fetchone()

        if not coupon:
            return jsonify({
                "error": "Invalid coupon code"
            }), 404

        if not coupon["is_active"]:
            return jsonify({
                "error": "This coupon is no longer active"
            }), 400

        if (
            coupon["expires_at"]
            and coupon["expires_at"] < datetime.now()
        ):
            return jsonify({
                "error": "This coupon has expired"
            }), 400

        if (
            coupon["usage_limit"] is not None
            and coupon["used_count"] >= coupon["usage_limit"]
        ):
            return jsonify({
                "error": "This coupon usage limit has been reached"
            }), 400

        if subtotal < float(coupon["min_order_amount"]):
            return jsonify({
                "error": (
                    f"Minimum order amount is "
                    f"₹{float(coupon['min_order_amount']):.0f}"
                )
            }), 400

        if coupon["discount_type"] == "PERCENTAGE":

            discount = subtotal * (
                float(coupon["discount_value"]) / 100
            )

        else:

            discount = float(
                coupon["discount_value"]
            )

        if coupon["max_discount"] is not None:

            discount = min(
                discount,
                float(coupon["max_discount"])
            )

        discount = min(
            discount,
            subtotal
        )

        final_subtotal = subtotal - discount

        return jsonify({
            "message": "Coupon applied successfully",
            "coupon": {
                "id": coupon["id"],
                "code": coupon["code"],
                "description": coupon["description"]
            },
            "subtotal": round(subtotal, 2),
            "discount": round(discount, 2),
            "final_subtotal": round(final_subtotal, 2)
        }), 200

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()