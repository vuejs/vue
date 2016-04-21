exports.command = function (selector) {
  return this.moveToElement(selector, 5, 5).doubleClick()
}
