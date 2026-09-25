package com.muslim.adhkar.wird;

import com.muslim.adhkar.wird.R;

/** ودجد «أذكار المساء» — فرع من HomeAdhkarProvider بخلفية ليلية. */
public class HomeEveningAdhkarProvider extends HomeAdhkarProvider {

    @Override
    protected String brand() {
        return "evening";
    }

    @Override
    protected int bgRes() {
        return R.drawable.widget_evening_bg;
    }
}