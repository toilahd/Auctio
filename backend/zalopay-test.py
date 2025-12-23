import time
import hmac
import hashlib
import json
import requests

# ================== CONFIG ==================
ZALOPAY_ENDPOINT = "https://sandbox.zalopay.com.vn/v001/tpe/createorder"

APPID = "554" # Định danh cho ứng dụng đã được cấp bởi ZaloPay.
KEY1 = "8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn"  # Mac Key do ZaloPay cung cấp

APPUSER = "demo" # Thông tin người dùng như: id/username/tên/số điện thoại/email của user. 50 ký tự
AMOUNT = "50000"
BANKCODE = ""   # bắt buộc với Mobile Web to App
DESCRIPTION = "Demo thanh toán ZaloPay"

# ================== AUTO GENERATED ==================
APPTIME = str(int(time.time() * 1000))  # milliseconds
APPTRANSID = time.strftime("%y%m%d") + "_000005" # Mã đơn hàng bên phía ứng dụng, format yymmdd của ngày hiện tại. Mã giao dịch nên theo format yymmdd_Mã đơn hàng thanh toán. Tạo lỗi -68 duplicate nếu trùng?

EMBEDDATA = json.dumps({
    "promotioninfo": "",
    "merchantinfo": "du lieu rieng cua ung dung"
}, separators=(",", ":"))

ITEM = json.dumps([
    {
        "itemid": "knb",
        "itemname": "kim nguyen bao",
        "itemprice": 50000,
        "itemquantity": 1
    }
], separators=(",", ":"))

# ================== CREATE MAC ==================
hmac_input = "|".join([
    APPID,
    APPTRANSID,
    APPUSER,
    AMOUNT,
    APPTIME,
    EMBEDDATA,
    ITEM
])

mac = hmac.new(
    KEY1.encode("utf-8"),
    hmac_input.encode("utf-8"),
    hashlib.sha256
).hexdigest()

# ================== REQUEST DATA ==================
payload = {
    "appid": APPID,
    "apptransid": APPTRANSID,
    "appuser": APPUSER,
    "apptime": APPTIME,
    "amount": AMOUNT,
    "embeddata": EMBEDDATA,
    "item": ITEM,
    "mac": mac,
    "bankcode": BANKCODE,
    "description": DESCRIPTION
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}

# ================== SEND REQUEST ==================
response = requests.post(ZALOPAY_ENDPOINT, data=payload, headers=headers)

# ================== OUTPUT ==================
print("===== REQUEST =====")
for k, v in payload.items():
    print(f"{k}: {v}")

print("\n===== RESPONSE =====")
print("Status code:", response.status_code)
print("Response text:", response.text)

try:
    print("Response JSON:", response.json())
except Exception:
    pass


# Possible error code: https://developer.zalopay.vn/v2/general/errors.html
print("\n===== NOTES =====")
print("Possible error codes are listed at: https://developer.zalopay.vn/v2/general/errors.html")
