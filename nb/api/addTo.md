[index](../../nb/api/index.md)
### shape.addTo()
Parameter|Default|Type
---|---|---
other||The shape to be extended.

Extends the form of other to cover the form of shape.

See: [add](../../nb/api/add.md).

![Image](addTo.md.$2.png)

Box(10).color('blue').addTo(Triangle(15).color('green')) produces a green result.

```JavaScript
Box(10)
  .color('blue')
  .addTo(Triangle(15).color('green'))
  .view()
  .note(
    "Box(10).color('blue').addTo(Triangle(15).color('green')) produces a green result."
  );
```

![Image](addTo.md.$3.png)

Box(10).color('blue').add(Triangle(15).color('green')) produces a blue result.

```JavaScript
Box(10)
  .color('blue')
  .add(Triangle(15).color('green'))
  .view()
  .note(
    "Box(10).color('blue').add(Triangle(15).color('green')) produces a blue result."
  );
```
