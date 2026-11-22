package com.mzhl.service.impl;

import com.mzhl.entity.UserCoupon;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 最优券组合枚举验证。
 * <p>
 * 背景：UserCouponServiceImpl#generateCombinations 用位掩码做 2^n 全枚举，
 * 但业务上限 MAX_STACKED_COUPONS=2（单笔订单最多叠加 2 张），
 * 所以 10 张券的实际候选组合是 C(10,1) + C(10,2) = 10 + 45 = 55 组，
 * 而不是 2^10 - 1 = 1023 组——这就是简历上「1023 → 55」的出处。
 * <p>
 * 用例把注释里的推导值固化成断言，防止有人改动截断/叠加逻辑后组合数悄悄变化。
 */
class UserCouponCombinationTest {

    /** 反射调用私有方法，不修改生产代码可见性 */
    private List<List<UserCoupon>> invokeGenerateCombinations(List<UserCoupon> coupons) throws Exception {
        UserCouponServiceImpl service = new UserCouponServiceImpl();
        Method method = UserCouponServiceImpl.class.getDeclaredMethod("generateCombinations", List.class);
        method.setAccessible(true);
        @SuppressWarnings("unchecked")
        List<List<UserCoupon>> result = (List<List<UserCoupon>>) method.invoke(service, coupons);
        return result;
    }

    private List<UserCoupon> coupons(int n) {
        List<UserCoupon> list = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            list.add(UserCoupon.builder().id((long) i).couponId((long) i).build());
        }
        return list;
    }

    @Test
    void tenCouponsShouldYield55Combinations() throws Exception {
        List<List<UserCoupon>> combinations = invokeGenerateCombinations(coupons(10));

        // C(10,1) + C(10,2) = 10 + 45 = 55
        assertEquals(55, combinations.size(),
                "10 张券在单笔叠加 ≤2 张约束下的候选组合应为 55 组（而非 2^10-1=1023）");
    }

    @Test
    void combinationsShouldNeverExceedStackLimit() throws Exception {
        List<List<UserCoupon>> combinations = invokeGenerateCombinations(coupons(10));

        for (List<UserCoupon> combination : combinations) {
            assertTrue(combination.size() >= 1 && combination.size() <= 2,
                    "每个组合只能是 1 张或 2 张券，实际: " + combination.size());
        }
    }

    @Test
    void combinationsShouldMatchBinomialFormula() throws Exception {
        // 小规模验证公式 C(n,1) + C(n,2) = n + n(n-1)/2
        assertEquals(3, invokeGenerateCombinations(coupons(2)).size());      // 2 + 1
        assertEquals(6, invokeGenerateCombinations(coupons(3)).size());      // 3 + 3
        assertEquals(28, invokeGenerateCombinations(coupons(7)).size());     // 7 + 21
        assertEquals(55, invokeGenerateCombinations(coupons(10)).size());    // 10 + 45
    }

    @Test
    void combinationsShouldNotContainDuplicates() throws Exception {
        List<List<UserCoupon>> combinations = invokeGenerateCombinations(coupons(10));

        long distinctCount = combinations.stream()
                .map(c -> c.stream().map(UserCoupon::getId).sorted().toList())
                .distinct()
                .count();
        assertEquals(combinations.size(), distinctCount, "位掩码枚举不应产生重复组合");
    }
}
