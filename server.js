var PROTO_PATH = './protos/stock_exchange.proto'

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
	PROTO_PATH, {
		keepCase: true,
		longs: String,
		enums: String,
		defaults: true,
		oneofs: true
	});
var stock_exchange = grpc.loadPackageDefinition(packageDefinition).stock_exchange;

let store = {
	orders: [],
	transactions: [],
};
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
	var server = new grpc.Server();
	server.addService(stock_exchange.StockExchange.service, {
		OrderCreate,
		OrderStatus,
		OrderCancel,
		UserOrders
	});
	server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
	server.start();
}

main();

function OrderCreate(call, callback) {
	let {
		user,
		stock,
		buy,
		price,
		quantity
	} = call.request.order;
	let current_id = getId();
	let matchedOrders = store.orders.filter(order => {
		return order.stock == stock &&
			order.quantity > 0 &&
			order.user != user &&
			order.buy != buy &&
			checkOverLap(buy, price, order.price);
	});
	if (buy) {
		matchedOrders.sort((a, b) => (a.price > b.price ? 1 : -1))
	} else {
		matchedOrders.sort((a, b) => (a.price > b.price ? -1 : 1))
	}
	let matches = [];
	for (let order of matchedOrders) {
		let matchQuantity = Math.min(order.quantity, quantity);
		let bestPrice = getBestPrice(buy, order.price, price);
		matches.push({
			price: bestPrice,
			quantity: matchQuantity
		});

		store.transactions.push({
			stock,
			buying_user: buy ? user : order.user,
			selling_user: !buy ? user : order.user,
			matchQuantity,
			bestPrice,
			created_at: now()
		});
		updateOrder(order.id, {
			quantity: order.quantity - matchQuantity
		});
		quantity -= matchQuantity;
	}

	store.orders.push({
		id: current_id,
		user,
		stock,
		buy,
		price,
		quantity,
		created_at: Date.now()
	});

	console.table(store.transactions);
	callback(null, {
		order_id: current_id,
		active: quantity > 0,
		matches
	});
}

function OrderStatus(call, callback) {
	let order = getOrderById(call.request.order_id);
	callback(null, {
		order_id: order.id,
		active: order.quantity > 0
	});
}

function OrderCancel(call, callback) {
	updateOrder(call.request.order_id, {
		quantity: 0
	});
	callback(null, {
		order_id: call.request.order_id,
		active: false
	});
}
function UserOrders(call, callback) { // incomplete
	let {user, start_time, end_time} = call.request.user;
	let transactions = store.transactions.filter(t=>{
		return (t.buying_user == user || t.selling_user == user)
		&& t.created_at >= start_time
		&& t.created_at <= end_time;
	});
	let res_data = [];
	// for (let i = 0; i < ; ++i) {
	// 	
	// }

	// uint64 order_id = 2;
	// bool active = 4;
	// repeated OrderMatch matches = 5;
	// updateOrder(, {
	// 	quantity: 0
	// });
	// callback(null, {
	// 	order_id: call.request.order_id,
	// 	active: false
	// });
}

// helper methods
function checkOverLap(buy, price1, price2) {
	if (buy) return price1 >= price2;
	return price1 <= price2;
}

function updateOrder(id, updates) {
	for (let i = 0; i < store.orders.length; ++i) {
		if (id == store.orders[i].id) {
			for (let k in updates) {
				store.orders[i][k] = updates[k];
			}
		}
	}
}

function getOrderById(id) {
	for (let i = 0; i < store.orders.length; ++i) {
		if (id == store.orders[i].id) {
			return store.orders[i];
		}
	}
}

function getBestPrice(buy, oldPrice, currentOrderPrice) {
	if (buy) {
		return Math.min(oldPrice, currentOrderPrice);
	}
	return Math.max(oldPrice, currentOrderPrice);
}

function getId() {
	return parseInt([Date.now(), parseInt(Math.random() * 1000)].join(''));
}

function now() {
	return parseInt(new Date() / 1000);
}
