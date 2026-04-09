package io.stavros.tungstenrn.androidauto

import androidx.car.app.CarContext
import androidx.car.app.Screen
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.GridItem
import androidx.car.app.model.GridTemplate
import androidx.car.app.model.ItemList
import androidx.car.app.model.ListTemplate
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template

class MainCarScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val screens = CarDataStore.loadScreens(carContext)

        val favorites = screens
            .flatMap { it.ui }
            .filter { it.autoFavorite && it.label.isNotBlank() }

        if (favorites.isNotEmpty()) {
            val listBuilder = ItemList.Builder()
            for (button in favorites) {
                listBuilder.addItem(
                    GridItem.Builder()
                        .setTitle(button.label)
                        .setImage(colorCircleIcon(button.label))
                        .setOnClickListener {
                            CarActionExecutor.execute(carContext, button.url)
                        }
                        .build()
                )
            }

            listBuilder.addItem(
                GridItem.Builder()
                    .setTitle("All panes")
                    .setImage(gridIcon())
                    .setOnClickListener {
                        screenManager.push(ScreenListScreen(carContext))
                    }
                    .build()
            )

            return GridTemplate.Builder()
                .setItemSize(GridTemplate.ITEM_SIZE_LARGE)
                .setTitle("Tungsten")
                .setHeaderAction(Action.APP_ICON)
                .setActionStrip(
                    ActionStrip.Builder()
                        .addAction(
                            Action.Builder()
                                .setTitle("Refresh")
                                .setOnClickListener { invalidate() }
                                .build()
                        )
                        .build()
                )
                .setSingleList(listBuilder.build())
                .build()
        }

        if (screens.isEmpty()) {
            return MessageTemplate.Builder(
                "No screens configured.\nAdd screens in the Tungsten app on your phone."
            )
                .setTitle("Tungsten")
                .setHeaderAction(Action.APP_ICON)
                .addAction(
                    Action.Builder()
                        .setTitle("Refresh")
                        .setOnClickListener { invalidate() }
                        .build()
                )
                .build()
        }

        if (screens.size == 1) {
            return buildButtonList(screens[0])
        }

        val listBuilder = ItemList.Builder()
        for (screen in screens) {
            listBuilder.addItem(
                Row.Builder()
                    .setTitle(screen.title)
                    .setBrowsable(true)
                    .setOnClickListener {
                        screenManager.push(ButtonListScreen(carContext, screen))
                    }
                    .build()
            )
        }

        return ListTemplate.Builder()
            .setTitle("Tungsten")
            .setHeaderAction(Action.APP_ICON)
            .setActionStrip(
                ActionStrip.Builder()
                    .addAction(
                        Action.Builder()
                            .setTitle("Refresh")
                            .setOnClickListener { invalidate() }
                            .build()
                    )
                    .build()
            )
            .setSingleList(listBuilder.build())
            .build()
    }

    private fun buildButtonList(screen: ScreenData): Template {
        val listBuilder = ItemList.Builder()
        for (button in screen.ui) {
            if (button.label.isBlank()) continue
            listBuilder.addItem(
                GridItem.Builder()
                    .setTitle(button.label)
                    .setImage(colorCircleIcon(button.label))
                    .setOnClickListener {
                        CarActionExecutor.execute(carContext, button.url)
                    }
                    .build()
            )
        }

        val itemList = listBuilder.build()
        if (itemList.items.isEmpty()) {
            return MessageTemplate.Builder("No buttons configured.")
                .setTitle(screen.title)
                .setHeaderAction(Action.APP_ICON)
                .addAction(
                    Action.Builder()
                        .setTitle("Refresh")
                        .setOnClickListener { invalidate() }
                        .build()
                )
                .build()
        }

        return GridTemplate.Builder()
            .setItemSize(GridTemplate.ITEM_SIZE_LARGE)
            .setTitle(screen.title)
            .setHeaderAction(Action.APP_ICON)
            .setActionStrip(
                ActionStrip.Builder()
                    .addAction(
                        Action.Builder()
                            .setTitle("Refresh")
                            .setOnClickListener { invalidate() }
                            .build()
                    )
                    .build()
            )
            .setSingleList(itemList)
            .build()
    }
}
