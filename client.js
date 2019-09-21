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

function main() {
	var client = new stock_exchange.StockExchange('localhost:50051',
																								grpc.credentials.createInsecure());
	var user =  'world';
	// client.sayHello({name: user}, function(err, response) {
	//   console.log('Greeting:', response.message);
	// });

	let order = {
		user: 'Bob',
		created_at: now(),
		buy: true,
		quantity:1,
		price:95, stock: "APPL"
	};
	client.OrderCreate({order:order}, function(err, response) {
		console.log('order created:', response);
	});
}

main();
function now() {
	return parseInt(new Date()/1000);
}
