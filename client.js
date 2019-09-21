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

function main() {
	var client = new stock_exchange.StockExchange('localhost:50051', grpc.credentials.createInsecure());

	let order = getOrder('Bob', true, 1, 95, 'APPL');
	client.OrderCreate({ order: order }, function(err, res) {
		console.log('order created:', res);
		let order = getOrder('Bill', false, 1, 95, 'APPL');
		client.OrderCreate({ order: order }, function(err, res) {
			console.log('order created:', res);
		});
		// client.OrderStatus({
		// 	order_id: res.order_id
		// }, function(err, res) {
		// 	console.log(res);
		// });
	});
}

main();

function now() {
	return parseInt(new Date() / 1000);
}

function getOrder(user, buy, quantity, price, stock, ) {
	return {
		user,
		created_at: now(),
		buy,
		quantity,
		price,
		stock
	}
}
