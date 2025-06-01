const config = {
  vnp_TmnCode: "YOUR_TMN_CODE", // Mã website của merchant trên VNPay
  vnp_HashSecret: "YOUR_HASH_SECRET", // Secret key để tạo checksum
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toán của VNPay
  vnp_ReturnUrl: "http://localhost:5000/api/payments/vnpay-return", // URL callback khi thanh toán xong
  vnp_IpnUrl: "http://localhost:5000/api/payments/vnpay-ipn", // URL callback cho IPN
  vnp_Version: "2.1.0", // Phiên bản API
  vnp_Command: "pay", // Lệnh thanh toán
  vnp_CurrCode: "VND", // Đơn vị tiền tệ
  vnp_Locale: "vn", // Ngôn ngữ
};

module.exports = config; 