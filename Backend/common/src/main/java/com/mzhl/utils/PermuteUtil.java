package com.mzhl.utils;

import java.util.ArrayList;
import java.util.List;

/**
 * 全排列算法工具类
 * 核心技术：回溯算法生成全排列，用于查找最优优惠券组合
 *
 * 使用场景：
 * - 用户持有多种优惠券时，计算使用顺序对最终折扣的影响
 * - 优惠券使用顺序会影响最终优惠金额（因为每满减等策略依赖当前剩余金额）
 * - 通过全排列枚举所有使用顺序，找到最优方案
 *
 * 算法复杂度：
 * - 时间：O(n!) - n个元素的全排列数量
 * - 空间：O(n) - 递归栈深度
 *
 * 注意事项：
 * - n不宜过大，建议n <= 8（8! = 40320种排列）
 * - 对于大量优惠券，先用贪心筛选最优K张再做全排列
 */
public class PermuteUtil {

    /**
     * 生成列表元素的所有全排列
     *
     * @param items 原始列表
     * @param <T>   元素类型
     * @return 所有排列的列表
     *
     * 示例：
     * 输入：[A, B, C]
     * 输出：[[A,B,C], [A,C,B], [B,A,C], [B,C,A], [C,A,B], [C,B,A]]
     */
    public static <T> List<List<T>> permute(List<T> items) {
        List<List<T>> result = new ArrayList<>();
        if (items == null || items.isEmpty()) {
            result.add(new ArrayList<>());
            return result;
        }

        // 使用回溯算法生成全排列
        backtrack(items, new boolean[items.size()], new ArrayList<>(), result);
        return result;
    }

    /**
     * 生成所有非空子集（组合）
     *
     * @param items 原始列表
     * @param <T>   元素类型
     * @return 所有非空组合的列表
     *
     * 示例：
     * 输入：[A, B, C]
     * 输出：[[A], [B], [C], [A,B], [A,C], [B,C], [A,B,C]]
     */
    public static <T> List<List<T>> subset(List<T> items) {
        List<List<T>> result = new ArrayList<>();
        if (items == null || items.isEmpty()) {
            return result;
        }

        int n = items.size();
        // 使用位掩码生成所有子集（除空集外）
        for (int mask = 1; mask < (1 << n); mask++) {
            List<T> subset = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0) {
                    subset.add(items.get(i));
                }
            }
            result.add(subset);
        }

        return result;
    }

    /**
     * 生成指定大小的所有排列（从n个元素中选k个排列）
     *
     * @param items 原始列表
     * @param k     选取的数量
     * @param <T>   元素类型
     * @return 所有k个元素的排列列表
     *
     * 示例：
     * 输入：[A, B, C], k=2
     * 输出：[[A,B], [A,C], [B,A], [B,C], [C,A], [C,B]]
     */
    public static <T> List<List<T>> permuteK(List<T> items, int k) {
        List<List<T>> result = new ArrayList<>();
        if (items == null || items.isEmpty() || k <= 0 || k > items.size()) {
            return result;
        }

        backtrackK(items, new boolean[items.size()], new ArrayList<>(), k, result);
        return result;
    }

    /**
     * 生成所有非空子集的排列（每个子集的所有排列顺序）
     * 这是 findOptimalCoupons 的核心算法
     *
     * @param items 原始列表
     * @param <T>   元素类型
     * @return 所有非空子集的所有排列
     *
     * 示例：
     * 输入：[A, B]
     * 输出（所有非空排列）：
     *   [A], [B], [A,B], [B,A]
     */
    public static <T> List<List<T>> permuteAllNonEmpty(List<T> items) {
        List<List<T>> result = new ArrayList<>();
        if (items == null || items.isEmpty()) {
            return result;
        }

        // 对每个大小的子集生成排列
        for (int k = 1; k <= items.size(); k++) {
            result.addAll(permuteK(items, k));
        }

        return result;
    }

    /**
     * 回溯算法核心 - 全排列
     */
    private static <T> void backtrack(List<T> items, boolean[] used,
                                       List<T> current, List<List<T>> result) {
        // 找到一个完整排列
        if (current.size() == items.size()) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < items.size(); i++) {
            if (!used[i]) {
                // 选择
                used[i] = true;
                current.add(items.get(i));

                // 递归
                backtrack(items, used, current, result);

                // 撤销选择（回溯）
                current.remove(current.size() - 1);
                used[i] = false;
            }
        }
    }

    /**
     * 回溯算法核心 - 选k个排列
     */
    private static <T> void backtrackK(List<T> items, boolean[] used,
                                        List<T> current, int k, List<List<T>> result) {
        // 找到k个元素的排列
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }

        for (int i = 0; i < items.size(); i++) {
            if (!used[i]) {
                used[i] = true;
                current.add(items.get(i));

                backtrackK(items, used, current, k, result);

                current.remove(current.size() - 1);
                used[i] = false;
            }
        }
    }
}