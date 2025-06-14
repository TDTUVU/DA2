const crypto = require('crypto');
const querystring = require('querystring');
const moment = require('moment');
const vnpayConfig = require('../config/vnpay.config');

/**
 * Tạo URL thanh toán VNPay dựa trên thông tin đơn hàng
 * @param {Object} paymentInfo Thông tin thanh toán
 * @param {String} ipAddr Địa chỉ IP của người dùng
 * @returns {String} URL thanh toán VNPay
 */
function createPaymentUrl(paymentInfo, ipAddr) {
  const dateFormat = moment(new Date()).format('YYYYMMDDHHmmss');
  const orderId = `${moment().unix()}_${paymentInfo.booking_id.substring(0, 8)}`;

  console.log('--- VNPAY DEBUGGING ---');
  console.log('TmnCode đang sử dụng:', vnpayConfig.vnp_TmnCode);
  console.log('Secret Key (5 ký tự đầu):', vnpayConfig.vnp_HashSecret.substring(0, 5) + '...');
  console.log('IP Address được gửi đi:', ipAddr);
  console.log('Return URL được gửi đi:', vnpayConfig.vnp_ReturnUrl);
  console.log('-------------------------');

  const vnp_Params = {
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: vnpayConfig.vnp_Command,
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: vnpayConfig.vnp_Locale,
    vnp_CurrCode: vnpayConfig.vnp_CurrCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: `Thanh toan cho booking ${paymentInfo.booking_id}`,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(paymentInfo.amount * 100),
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: dateFormat
  };

  console.log('--- VNPay Parameters Before Sorting ---');
  console.log(JSON.stringify(vnp_Params, null, 2));

  // Sắp xếp các tham số theo thứ tự a-z
  const sortedParams = sortObject(vnp_Params);
  
  // Tạo chuỗi dữ liệu để ký (signData)
  // Sử dụng querystring.stringify để đảm bảo encoding đồng nhất thay vì thay thế thủ công.
  // Điều này sẽ mã hóa các ký tự đặc biệt (VD: khoảng trắng thành '%20') một cách chuẩn hóa.
  const signData = querystring.stringify(sortedParams);
  
  console.log('--- VNPay Sign Data String (Corrected) ---');
  console.log(signData);

  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  // Thêm chữ ký vào danh sách tham số để tạo URL cuối cùng.
  // querystring.stringify sẽ URL encode các giá trị này.
  const paramsForUrl = { ...sortedParams };
  paramsForUrl['vnp_SecureHash'] = signed;
  
  const paymentUrl = `${vnpayConfig.vnp_Url}?${querystring.stringify(paramsForUrl)}`;
  
  console.log('--- Final VNPay URL ---');
  console.log(paymentUrl);

  return paymentUrl;
}

/**
 * Kiểm tra tính hợp lệ của chữ ký VNPay
 * @param {Object} vnpParams Tham số trả về từ VNPay
 * @returns {Boolean} Kết quả kiểm tra
 */
function verifyReturnUrl(vnpParams) {
  const secureHash = vnpParams['vnp_SecureHash'];
  
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType']; // Xóa cả vnp_SecureHashType nếu có
  
  const sortedParams = sortObject(vnpParams);
  
  // Tạo chuỗi dữ liệu để ký (signData)
  // Sử dụng querystring.stringify để đảm bảo encoding đồng nhất khi xác thực chữ ký trả về.
  const signDataVerify = querystring.stringify(sortedParams);
  
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signDataVerify, 'utf-8')).digest('hex');
  
  return secureHash === signed;
}

/**
 * Sắp xếp object theo key (a-z)
 * @param {Object} obj
 * @returns {Object} Object đã sắp xếp
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl
}; 