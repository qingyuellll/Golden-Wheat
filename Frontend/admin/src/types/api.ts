/**
 * 后端统一响应结构 Result<T>
 * code: 1 成功；0 或其它失败
 */
export interface Result<T = unknown> {
  code: number
  msg: string | null
  data: T | null
}

/** 分页响应结构 PageResult */
export interface PageResult<T = unknown> {
  total: number
  records: T[]
}

/** 分页查询基类 */
export interface PageQuery {
  page: number
  pageSize: number
}

/* ===== 员工模块 ===== */
export interface EmployeeLoginDTO {
  username: string
  password: string
}

export interface EmployeeLoginVO {
  id: number
  userName: string
  name: string
  token: string
}

export interface EmployeeDTO {
  id?: number
  username: string
  name: string
  phone: string
  sex: string
  idNumber: string
}

export interface Employee {
  id: number
  username: string
  name: string
  password?: string
  phone: string
  sex: string
  idNumber: string
  status: number
  createTime: string
  updateTime: string
  createUser?: number | null
  updateUser?: number | null
}

export interface EmployeePageQuery extends PageQuery {
  name?: string
}

/* ===== 菜品模块 ===== */
export interface DishFlavor {
  id?: number
  dishId?: number
  name: string
  value: string
}

export interface DishDTO {
  id?: number
  name: string
  categoryId: number
  price: number
  image: string
  description?: string
  status?: number
  flavors?: DishFlavor[]
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

export interface DishPageQuery extends PageQuery {
  name?: string
  categoryId?: number
  status?: number
}

/* ===== 分类模块 ===== */
export interface CategoryDTO {
  id?: number
  type: number
  name: string
  sort?: number
}

export interface Category {
  id: number
  type: number
  name: string
  sort: number
  status: number
  createTime: string
  updateTime: string
  createUser?: number | null
  updateUser?: number | null
}

export interface CategoryPageQuery extends PageQuery {
  name?: string
  type?: number
}

/* ===== 套餐模块 ===== */
export interface SetmealDish {
  id?: number
  setmealId?: number
  dishId: number
  name: string
  price: number
  copies: number
}

export interface SetmealDTO {
  id?: number
  categoryId: number
  name: string
  price: number
  status?: number
  description?: string
  image: string
  setmealDishes: SetmealDish[]
}

export interface SetmealVO {
  id: number
  categoryId: number
  name: string
  price: number
  status: number
  description: string
  image: string
  updateTime: string
  categoryName: string
  setmealDishes: SetmealDish[]
}

export interface SetmealPageQuery extends PageQuery {
  name?: string
  categoryId?: number
  status?: number
}

/* ===== 订单模块 ===== */
export type OrderStatus = 1 | 2 | 3 | 4 | 5 | 6

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

export interface OrdersPageQuery extends PageQuery {
  number?: string
  phone?: string
  status?: OrderStatus
  beginTime?: string
  endTime?: string
  userId?: number
}

export interface OrderStatistics {
  toBeConfirmed: number
  confirmed: number
  deliveryInProgress: number
}

export interface OrdersConfirmDTO {
  id: number
  status?: number
}

export interface OrdersRejectionDTO {
  id: number
  rejectionReason: string
}

export interface OrdersCancelDTO {
  id: number
  cancelReason: string
}

/* ===== 优惠券模块 ===== */
export interface CouponDTO {
  id?: number
  name: string
  type: number
  discountType: number
  specific: number
  discountValue: number
  thresholdAmount?: number
  maxDiscountAmount?: number
  obtainWay: number
  issueBeginTime?: string
  issueEndTime?: string
  termDays?: number
  termBeginTime?: string
  termEndTime?: string
  totalNum: number
  userLimit?: number
  extParam?: string
  scopeIds?: number[]
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
  /** 0 全场通用，1 定向券 */
  specific: number
  scopeDesc: string
}

export interface CouponPageQuery extends PageQuery {
  name?: string
  status?: number
}

/* ===== 商铺 / 工作台 ===== */
export interface ShopStatus {
  status: number
}

export interface BusinessData {
  turnover: number
  validOrderCount: number
  orderCompletionRate: number
  unitPrice: number
  newUsers: number
}

export interface OrderOverView {
  waitingOrders: number
  deliveredOrders: number
  completedOrders: number
  cancelledOrders: number
  allOrders: number
}

export interface DishOverView {
  sold: number
  discontinued: number
}

export interface SetmealOverView {
  sold: number
  discontinued: number
}

/* ===== 报表模块 ===== */
export interface TurnoverReport {
  dateList: string
  turnoverList: string
}

export interface UserReport {
  dateList: string
  totalUserList: string
  newUserList: string
}

export interface OrderReport {
  dateList: string
  orderCountList: string
  validOrderCountList: string
  totalOrderCount: number
  validOrderCount: number
  orderCompletionRate: number
}

export interface SalesTop10Report {
  nameList: string
  numberList: string
}
