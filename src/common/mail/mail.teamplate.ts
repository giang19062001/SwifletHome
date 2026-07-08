import { USER_CONST } from "src/modules/user/app/user.const";

export function getGuestTemplate(data: { name: string; phone: string; issueInterest: string; issueDescription: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.name}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.phone}</p>
          <p style="margin: 15px 20px;"><strong>Hạng mục cần tư vấn:</strong> ${data.issueInterest}</p>
          <p style="margin: 15px 20px;"><strong>Mô tả chi tiết:</strong> ${data.issueDescription}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.phone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getDoctorTemplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
          <p style="margin: 15px 20px;"><strong>Địa chỉ khu vực:</strong> ${data.note}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getSightSeeingTemplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Tên nhà yến:</strong> ${data.homeName}</p>
          <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
          <p style="margin: 15px 20px;"><strong>Số lượng người tham quan:</strong> ${data.numberAttend}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getTeamTemplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Tên đội/xưởng:</strong> ${data.teamName}</p>
          <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.teamUserName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.teamPhone}</p>
          <p style="margin: 15px 20px;"><strong>Địa chỉ:</strong> ${data.teamAddress}</p>
          <p style="margin: 15px 20px;"><strong>Loại đội/xưởng đăng ký:</strong> ${data.userTypeKeyWord == USER_CONST.USER_TYPE.FACTORY.value ? USER_CONST.USER_TYPE.FACTORY.text : USER_CONST.USER_TYPE.TECHNICAL.text}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.teamPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getRequestQrTemplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Tên nhà yến:</strong> ${data.userHomeName}</p>
          <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
          <p style="margin: 15px 20px;"><strong>Đợt thu hoạch:</strong> ${data.harverstPhase}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getConsignmentTemplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Người gửi:</strong> ${data.senderName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại người gửi:</strong> ${data.senderPhone}</p>
          <p style="margin: 15px 20px;"><strong>Loại tổ yến:</strong> ${data.nestType}</p>
          <p style="margin: 15px 20px;"><strong>Số lượng tổ yến (gram):</strong> ${data.nestQuantity}</p>
          <p style="margin: 15px 20px;"><strong>Địa chỉ giao nhận:</strong> ${data.deliveryAddress}</p>
          <p style="margin: 15px 20px;"><strong>Người nhận:</strong> ${data.receiverName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại người nhận:</strong> ${data.receiverPhone}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.senderPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}

export function getSaleHomeTeamplate(data: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="padding: 0px; color: #333;">
        <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 15px 20px;"><strong>Tên nhà yến:</strong> ${data.homeName}</p>
          <p style="margin: 15px 20px;"><strong>Họ và tên chủ nhà:</strong> ${data.userName}</p>
          <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
          <p style="margin: 15px 20px;"><strong>Địa chỉ:</strong> ${data.homeAddress}</p>
        </div>
        <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
      </div>
  `;
}
