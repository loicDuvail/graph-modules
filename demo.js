const canvasContainer = document.getElementById("parent");

const grid = new GridCanvas(canvasContainer);
grid.setPlane([0, -0.01, 51, 1.01]);

const graph = new GraphCanvas(canvasContainer);

let pow2 = (x) => x ** 2;
let sin = (x) => Math.sin(x);

let values = [],
  values1 = [],
  values2 = [];
for (let x = 0; x < 100; x += Math.random()) {
  values.push([x, sin(x / 4)]);
  values1.push([x, pow2(x)]);
}
for (let x = 0; x < 10; x += 1) {
  values2.push([x, pow2(x)]);
}

graph.setValuesToPlot(values);
graph.plot(true);

graph.setValuesToPlot(values2);
graph.setPlotStyle("towers");
graph.setPlotColor("rgba(50,200,50,0.5)");
graph.plot(true);

graph.setValuesToPlot(values);
graph.setPlotColor("rgba(50,50,200,0.5)");
graph.setPlotStyle("dot");
graph.plot(true);
