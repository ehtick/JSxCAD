Hollow torus with void cut-out.

```JavaScript
Arc(10)
  .cut(Triangle(5))
  .rx(1 / 4)
  .x(10)
  .loop(...seq((a) => rz(a), { by: 1 / 32, upto: 1 }))
  .cutOut(Box(20, 20).ex(20))
  .view();
```

![Image](examples.md.0.png)

Cube with red cut-out.

```JavaScript
Box(10, 10, 10)
  .cutOut(Arc(5, 5, 10), color('red'))
  .view();
```

![Image](examples.md.1.png)