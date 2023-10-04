the goal of this graph module is to easely render graphs on elements, with options given to the user to choose colors, precision, grid dimensions, zoom level etc....

--I-- Canvas:

the canvas folder contains classes made to make easier the use of canvas in the context of graph making, it contains:

-Canvas class: class used to easely create a canvas and append it as a child of a HTML element.

-MathCanvas class: class extending Canvas class, used to make easier the use of canvas in a mathematical context.
It inverts the y axis to match mathematical standars and allows for plane mapping, setting a virtual plane in which any shape will be drawn,
which are then mapped to the actual canvas

-GridCanvas class: class extending Math canvas, used to easely render grids, with options such as grid color and line width, subgrid color and line width, automatic virtual step selection with minStepPx and maxStepPx
which draws line and sets units on the axis
