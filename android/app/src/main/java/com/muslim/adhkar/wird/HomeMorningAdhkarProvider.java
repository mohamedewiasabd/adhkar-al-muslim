package com.muslim.adhkar.wird;

import com.muslim.adhkar.wird.R;

/** ودجد «أذكار الصباح» — فرع من HomeAdhkarProvider بخلفية مشرقة. */
public class HomeMorningAdhkarProvider extends HomeAdhkarProvider {

    @Override
    protected String brand() {
        return "morning";
    }

    @Override
    protected int bgRes() {
        return R.drawable.widget_morning_bg;
    }
}