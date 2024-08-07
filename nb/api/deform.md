[index](../../nb/api/index.md)
### deform()
Parameter|Default|Type
---|---|---
...selections||Shapes: the selections to manipulate
{iterations}|1000|The number of deformation passes to take
{tolerance}|0.0001|
{alpha}|0.02|

The local frame of each selection is used in absolute space to select a region of the shape.

The selected regions are then transformed to the selection's absolute frame.

Primitive shapes are created in their local orientation, but arbitrary shapes can be used with absolute.

e.g., '''shape.deform(other.absolute().rx(1/4))'''

See: [absolute](../../nb/api/absolute.md)

![Image](deform.md.$2_1.png)

```JavaScript
Box(10, 3, 3)
  .remesh(1)
  .deform(
    Box([4.8, 5], 3, 3).rx(1 / 4),
    Box([-5, -4.8], 3, 3).rx(-1 / 4),
    Box([-0.1, 0.1], 3, 3).z(3),
    {
      iterations: 1000,
      tolerance: 0.001,
      alpha: 0.05,
    }
  )
  .view(1);
```
