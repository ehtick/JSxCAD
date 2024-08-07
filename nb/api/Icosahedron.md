[index](../../nb/api/index.md)
# Icosahedron(...dimensions)

Produces an icosahedron that fits the bounding dimensions.

![Image](Icosahedron.md.$2.png)

Icosahedron(3)

```JavaScript
Icosahedron(3).and(Box(3, 3, 3).material('glass')).view().note('Icosahedron(3)');
```

![Image](Icosahedron.md.$3.png)

Icosahedron(1, 2, [0, 3])

```JavaScript
Icosahedron(1, 2, [0, 3])
  .and(Box(1, 2, [0, 3]).material('glass'))
  .view()
  .note('Icosahedron(1, 2, [0, 3])');
```
