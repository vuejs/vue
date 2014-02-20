module.exports = {

  bind: function() {
    var pattern = new RegExp(/[a-zA-Z]|\d|-|_+/g),
      isSafe = pattern.test(this.key);

    if (!isSafe) return;

    if (!this.vm.$controls) {
      this.vm.$controls = {};
    }

    this.vm.$controls[this.key] = this.el
  }
}