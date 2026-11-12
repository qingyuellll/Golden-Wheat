export interface Result<T = unknown> {
  code: number
  msg: string | null
  data: T | null
}

export type ApiResponse<T = unknown> = Result<T>

export interface PageResult<T = unknown> {
  total: number
  records: T[]
}

export interface PageQuery {
  page: number
  pageSize: number
}

export interface UserLoginDTO {
  phone: string
  code: string
}

export interface UserLoginVO {
  id: number
  openid: string
  token: string
  refreshToken: string
}

export interface User {
  id: number
  openid: string
  name: string
  phone: string
}

export interface Category {
  id: number
  type: number
  name: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface DishFlavor {
  id?: number
  dishId?: number
  name: string
  value: string
}

export interface DishVO {
  id: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string
  status: number
  updateTime: string
  categoryName: string
  flavors: DishFlavor[]
}

export interface Dish {
  id: number
  name: string
  categoryId: number
  price: number
  image: string
  description: string
  status: number
  createTime?: string
  updateTime?: string
}

export interface Setmeal {
  id: number
  categoryId: number
  name: string
  price: number
  status: number
  description: string
  image: string
  createTime: string
  updateTime: string
}

export interface DishItemVO {
  name: string
  copies: number
  image: string
  description: string
}

export interface ShoppingCartDTO {
  dishId?: number
  setmealId?: number
  dishFlavor?: string
}

export interface ShoppingCart {
  id: number
  name: string
  userId: number
  dishId: number | null
  setmealId: number | null
  dishFlavor: string | null
  number: number
  amount: number
  image: string
  createTime: string
}

export interface AddressBook {
  id: number
  userId?: number
  consignee: string
  phone: string
  sex: string
  provinceCode: string
  provinceName: string
  cityCode: string
  cityName: string
  districtCode: string
  districtName: string
  detail: string
  label: string
  isDefault: number
  createTime?: string
  updateTime?: string
}

export type OrderStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface OrderDetail {
  id: number
  name: string
  orderId: number
  dishId?: number | null
  setmealId?: number | null
  dishFlavor?: string
  number: number
  amount: number
  image?: string
}

export interface OrderVO {
  id: number
  number: string
  status: OrderStatus
  userId: number
  addressBookId?: number
  orderTime: string
  checkoutTime?: string | null
  payMethod?: number
  payStatus?: number
  amount: number
  remark?: string
  userName: string
  phone: string
  address: string
  consignee: string
  cancelReason?: string
  rejectionReason?: string
  cancelTime?: string | null
  estimatedDeliveryTime?: string | null
  deliveryStatus?: number
  deliveryTime?: string | null
  packAmount?: number
  tablewareNumber?: number
  tablewareStatus?: number
  orderDishes?: string
  orderDetailList: OrderDetail[]
}

/**
 * 下单请求：金额（含打包费）与优惠金额一律由服务端按购物车和券规则核算，
 * 前端只提交"买什么、送到哪、用哪张券"，不参与算钱。
 */
export interface OrderSubmitDTO {
  addressBookId: number
  payMethod: number
  remark?: string
  estimatedDeliveryTime?: string
  deliveryStatus: number
  tablewareNumber: number
  tablewareStatus: number
  userCouponIds?: number[]
}

export interface OrderSubmitVO {
  id: number
  orderNumber: string
  orderAmount: number
  orderTime: string
}

export interface OrderPaymentDTO {
  orderNumber: string
  payMethod?: number
}

export interface OrderPaymentVO {
  nonceStr: string
  paySign: string
  timeStamp: string
  signType: string
  packageStr: string
}

export interface OrdersPageQuery extends PageQuery {
  status?: OrderStatus
}

/** 店铺公开配置：营业状态 + 每单固定打包费（元） */
export interface ShopConfig {
  status: number
  packFee: number
}

export interface CouponVO {
  id: number
  name: string
  typeDesc: string
  ruleDesc: string
  discountType: number
  discountValue: number
  thresholdAmount: number
  maxDiscountAmount?: number | null
  issueBeginTime: string
  issueEndTime: string
  validityDesc: string
  totalNum: number
  issueNum: number
  remainNum: number
  userLimit: number
  status: number
  statusDesc: string
  received?: boolean | null
  scopeDesc: string
}

export interface UserCouponVO {
  id: number
  couponId: number
  couponName: string
  ruleDesc: string
  discountValue: number
  thresholdAmount: number
  maxDiscountAmount?: number | null
  status: number
  statusDesc: string
  termBeginTime: string
  termEndTime: string
  remainDays: number
  expiringSoon: boolean
  usedTime: string | null
}

export interface AvailableCouponVO {
  userCouponId: number
  name: string
  discountAmount: number
  ruleDesc: string
  thresholdAmount: number
  canUse: boolean
  unavailableReason: string | null
}

export interface OptimalCouponVO {
  userCouponIds: number[]
  couponNames: string[]
  totalDiscount: number
  originalAmount: number
  payAmount: number
  savedAmount: number
}

export interface CouponCalculateItemDTO {
  itemId: number
  itemType: number
  /** 分类可缺省：后端按 itemId 回查菜品/套餐补齐，用于判定适用范围 */
  categoryId?: number
  price: number
  quantity: number
}

export interface CouponCalculateDTO {
  items: CouponCalculateItemDTO[]
  /** 勾选的券组合（user_coupon.id，顺序即核销顺序），组合试算时传 */
  userCouponIds?: number[]
}

/** 优惠券组合试算结果：与下单锁定同口径（逐张递减余额、门槛跳过） */
export interface CouponPreviewVO {
  orderAmount: number
  coupons: {
    userCouponId: number
    name: string
    discount: number
    /** 因未达门槛被跳过 */
    skipped: boolean
  }[]
  totalDiscount: number
  payAmount: number
}
