var PROTO_PATH = './protos/stock_exchange.proto'

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var stock_exchange = grpc.loadPackageDefinition(packageDefinition).stock_exchange;

var store = {
	orders: [],
};

function sayHello(call, callback) {
  callback(null, {message: 'Hello ' + call.request.name});
}

function OrderCreate(call, callback) {
	let order = call.request.order;
	store.orders.push(order);
	order.id = Date.now();
	callback(null, {
		order_id: order.id,
		active: 0
	});
}

/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
function main() {
  var server = new grpc.Server();
	server.addService(stock_exchange.StockExchange.service, {sayHello, OrderCreate});
	// server.addService(stock_exchange.StockExchange.service, { OrderCreate: OrderCreate });
  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
