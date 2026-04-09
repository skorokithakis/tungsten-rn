package io.stavros.tungstenrn.androidauto

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import androidx.car.app.model.CarIcon
import androidx.core.graphics.drawable.IconCompat

private val PALETTE = intArrayOf(
    0xFFE53935.toInt(), // red
    0xFFD81B60.toInt(), // pink
    0xFF8E24AA.toInt(), // purple
    0xFF3949AB.toInt(), // indigo
    0xFF1E88E5.toInt(), // blue
    0xFF00897B.toInt(), // teal
    0xFF43A047.toInt(), // green
    0xFFF4511E.toInt(), // deep orange
    0xFF6D4C41.toInt(), // brown
    0xFF00ACC1.toInt(), // cyan
    0xFF7CB342.toInt(), // light green
    0xFFFFB300.toInt(), // amber
)

private const val BITMAP_SIZE = 128

fun gridIcon(): CarIcon {
    val bitmap = Bitmap.createBitmap(BITMAP_SIZE, BITMAP_SIZE, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0xFFBDBDBD.toInt()
        style = Paint.Style.FILL
    }

    // Each cell occupies roughly half the bitmap, with a gap between cells and a margin
    // around the outside so the grid doesn't touch the icon edges.
    val margin = BITMAP_SIZE * 0.08f
    val gap = BITMAP_SIZE * 0.08f
    val cellSize = (BITMAP_SIZE - 2 * margin - gap) / 2f
    val cornerRadius = cellSize * 0.25f

    for (row in 0..1) {
        for (col in 0..1) {
            val left = margin + col * (cellSize + gap)
            val top = margin + row * (cellSize + gap)
            canvas.drawRoundRect(left, top, left + cellSize, top + cellSize, cornerRadius, cornerRadius, paint)
        }
    }

    return CarIcon.Builder(IconCompat.createWithBitmap(bitmap)).build()
}

fun colorCircleIcon(label: String): CarIcon {
    val color = PALETTE[(label.hashCode() and Int.MAX_VALUE) % PALETTE.size]

    val bitmap = Bitmap.createBitmap(BITMAP_SIZE, BITMAP_SIZE, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        this.color = color
        style = Paint.Style.FILL
    }
    val radius = BITMAP_SIZE / 2f
    canvas.drawCircle(radius, radius, radius, paint)

    return CarIcon.Builder(IconCompat.createWithBitmap(bitmap)).build()
}
