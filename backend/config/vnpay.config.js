require('dotenv').config(); // Thêm dòng này để load biến môi trường từ .env

const config = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "6BWQI278", // Mã website, đọc từ .env hoặc dùng fallback
  vnp_HashSecret: process.env.VNPAY_SECRET_KEY || "L52B04FR5LW4KRYZBZZW5E0BMENMVUTE", // Secret key, đọc từ .env hoặc dùng fallback
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toán VNPay Sandbox - CỐ ĐỊNH
  vnp_ReturnUrl: "http://localhost:3000/payment/vnpay-return", // URL callback về frontend sau khi thanh toán - CỐ ĐỊNH
  vnp_IpnUrl: "http://localhost:5000/api/payments/vnpay-ipn", // URL IPN về backend - CỐ ĐỊNH
  vnp_Version: "2.1.0", // Phiên bản API
  vnp_Command: "pay", // Lệnh thanh toán
  vnp_CurrCode: "VND", // Đơn vị tiền tệ
  vnp_Locale: "vn", // Ngôn ngữ
};

module.exports = config; 