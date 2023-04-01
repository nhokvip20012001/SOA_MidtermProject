module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = (item, id) => {
        var storedItem = this.items[id]
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0, status: '' }
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty
        storedItem.status = 'Processing'
        this.totalQty++;
        this.totalPrice += storedItem.item.price
    }
    this.delete = (id) => {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price

        if(this.items[id].qty <= 0){
            delete this.items[id]
        }
    }
    this.changeStatus = (id, status) => {
        this.items[id].status = status
    }
    this.generateArray = function () {
        var arr = []
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}