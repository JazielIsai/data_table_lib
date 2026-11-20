import AppKit
import Foundation

let width = 1280
let height = 640

func color(_ hex: UInt32) -> NSColor {
  NSColor(calibratedRed: CGFloat((hex >> 16) & 255) / 255,
          green: CGFloat((hex >> 8) & 255) / 255,
          blue: CGFloat(hex & 255) / 255, alpha: 1)
}

func rect(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) -> NSRect {
  NSRect(x: x, y: CGFloat(height) - y - h, width: w, height: h)
}

func fill(_ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat,
          _ radius: CGFloat, _ shade: NSColor) {
  shade.setFill()
  NSBezierPath(roundedRect: rect(x, y, w, h), xRadius: radius, yRadius: radius).fill()
}

func text(_ value: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat,
          _ h: CGFloat, _ size: CGFloat, _ shade: NSColor, bold: Bool = false) {
  let font = bold ? NSFont.systemFont(ofSize: size, weight: .bold)
                  : NSFont.systemFont(ofSize: size, weight: .regular)
  let paragraph = NSMutableParagraphStyle()
  paragraph.lineBreakMode = .byTruncatingTail
  (value as NSString).draw(in: rect(x, y, w, h), withAttributes: [
    .font: font, .foregroundColor: shade, .paragraphStyle: paragraph
  ])
}

func portrait(_ path: String, _ x: CGFloat, _ y: CGFloat, _ w: CGFloat, _ h: CGFloat) {
  guard let image = NSImage(contentsOfFile: path) else { return }
  NSGraphicsContext.saveGraphicsState()
  NSBezierPath(roundedRect: rect(x, y, w, h), xRadius: 10, yRadius: 10).addClip()
  let source = image.size
  let ratio = w / h
  let cropW = min(source.width, source.height * ratio)
  let cropH = min(source.height, source.width / ratio)
  let crop = NSRect(x: (source.width - cropW) / 2,
                    y: (source.height - cropH) / 2, width: cropW, height: cropH)
  image.draw(in: rect(x, y, w, h), from: crop, operation: .sourceOver,
             fraction: 1, respectFlipped: false, hints: nil)
  NSGraphicsContext.restoreGraphicsState()
}

let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width,
                            pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4,
                            hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
                            bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)

fill(0, 0, 1280, 640, 0, color(0x0D1422))
fill(55, 44, 44, 44, 12, color(0x3268E5))
for row in 0..<2 {
  for column in 0..<2 {
    fill(CGFloat(66 + column * 15), CGFloat(55 + row * 15), 11, 11, 3,
         row == 1 && column == 1 ? color(0xA6C1FF) : .white)
  }
}
text("Data Table Lib", 112, 51, 350, 40, 27, .white, bold: true)
text("REACT · TYPESCRIPT · MIT", 57, 142, 500, 30, 17, color(0x86ACFF), bold: true)
text("De tabla a galería,", 54, 210, 555, 72, 57, .white, bold: true)
text("sin cambiar tus datos.", 54, 282, 555, 72, 55, color(0x6B96FF), bold: true)
text("Fotos, edición, preferencias y CSV", 57, 382, 510, 44, 27, color(0xD3DDEC))
text("con una API lista para React.", 57, 423, 510, 44, 27, color(0xD3DDEC))
fill(57, 510, 306, 58, 12, color(0x3268E5))
text("Probar demo interactiva", 79, 524, 265, 31, 21, .white, bold: true)
text("isai-dev.com", 57, 596, 220, 27, 18, color(0x9AAAC1))

fill(631, 65, 592, 520, 22, color(0x1B2940))
fill(632, 65, 590, 47, 21, color(0x23334B))
fill(648, 85, 8, 8, 4, color(0xFF7770))
fill(663, 85, 8, 8, 4, color(0xFFC95A))
fill(678, 85, 8, 8, 4, color(0x69CD88))
text("Vista previa", 1072, 78, 125, 25, 15, color(0xA8B8CE))
text("Equipo", 650, 129, 250, 34, 25, .white, bold: true)
text("3 registros", 1093, 134, 100, 25, 15, color(0xA8B8CE))

fill(649, 172, 554, 214, 12, color(0x171D28))
text("NOMBRE", 668, 185, 180, 26, 14, color(0xB9C7D8), bold: true)
text("ÁREA", 892, 185, 110, 26, 14, color(0xB9C7D8), bold: true)
text("ESTADO", 1063, 185, 115, 26, 14, color(0xB9C7D8), bold: true)
let names = ["Ana García", "Luis Torres", "Marta Ruiz"]
let teams = ["Diseño", "Desarrollo", "Producto"]
let states = ["Activo", "Activo", "En revisión"]
for index in 0..<3 {
  let y = CGFloat(225 + index * 52)
  fill(650, y - 7, 552, 1, 0, color(0x344051))
  text(names[index], 668, y, 200, 28, 18, .white)
  text(teams[index], 892, y, 150, 28, 18, .white)
  fill(1056, y - 1, 128, 28, 13,
       index == 2 ? color(0x58441F) : color(0x1B513B))
  text(states[index], 1068, y + 3, 110, 25, 14,
       index == 2 ? color(0xFFE3A6) : color(0xA5ECC7), bold: true)
}
text("Los mismos datos, en galería", 650, 405, 420, 30, 21, .white, bold: true)
let photos = ["examples/assets/ana.jpg", "examples/assets/luis.jpg", "examples/assets/marta.jpg"]
for index in 0..<3 {
  let x = CGFloat(650 + index * 185)
  fill(x, 446, 174, 119, 10, color(0xF2F6FA))
  portrait(photos[index], x, 446, 174, 88)
  text(names[index], x + 9, 537, 155, 25, 14, color(0x26364D), bold: true)
}

NSGraphicsContext.restoreGraphicsState()
guard let png = bitmap.representation(using: .png, properties: [:]) else {
  fatalError("No se pudo generar la imagen")
}
try png.write(to: URL(fileURLWithPath: "docs/social-preview.png"))
try FileManager.default.createDirectory(atPath: "site/public", withIntermediateDirectories: true)
try png.write(to: URL(fileURLWithPath: "site/public/social-preview.png"))
