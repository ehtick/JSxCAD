![Image](shape.md.$1.png)

```JavaScript
Triangle(10).color('red').add(Box(5).color('blue')).gridView();
```

![Image](shape.md.$2.png)

```JavaScript
Box(5).and(Arc(5)).view('top', 'noSkin', 'noWireframe', { size: 800 });
```

![Image](shape.md.$3.png)

```JavaScript
Triangle(10).color('red').addTo(Box(5).color('blue')).gridView();
```

![Image](shape.md.$4.png)

```JavaScript
Box(5).align('x>y>').gridView();
```

![Image](shape.md.$5.png)

```JavaScript
Box(5).as('box').fitTo(Arc(4).as('arc')).drop(getNot('box')).gridView();
```

![Image](shape.md.$6.png)

```JavaScript
Box(5).color('red').clip(Arc(5.8).color('blue')).gridView();
```

![Image](shape.md.$7.png)

```JavaScript
Box(5).color('red').clipFrom(Arc(5.8).color('blue')).gridView();
```

![Image](shape.md.$8.png)

```JavaScript
Box(5).color('green').gridView();
```

Colors are [object Object]

Colors are undefined

```JavaScript
Box(5)
  .color('green')
  .tags('color', (colors) => note(`Colors are ${colors}`));
```

![Image](shape.md.$10.png)

```JavaScript
Box(5).color('red').cut(Arc(6).color('blue')).gridView();
```

![Image](shape.md.$11.png)

```JavaScript
Box(5).color('red').cutFrom(Arc(6).color('blue')).gridView();
```

![Image](shape.md.$12.png)

```JavaScript
Assembly(Box(5), Arc(6))
  .each((leafs) => leafs[0])
  .gridView();
```

![Image](shape.md.$13.png)

```JavaScript
Group(Box(5).color('red'), Arc(6).color('blue')).fuse().gridView();
```

![Image](shape.md.$14.png)

```JavaScript
Box(10).inset(0.5, { step: 0.5 }).disjoint().n(0, 2, 4, 6, 8).gridView();
```

![Image](shape.md.$15.png)

```JavaScript
Assembly(Box(10).as('a'), Arc(6).as('b')).drop(getNot('a')).gridView();
```

![Image](shape.md.$16.png)

```JavaScript
Box(10).material('copper').gridView();
```

![Image](shape.md.$17.png)

```JavaScript
Box(10).move(1, 2, 3).gridView();
```

![Image](shape.md.$18.png)

```JavaScript
Box(10).to(Point(1, 2, 3)).gridView();
```

![Image](shape.md.$19.png)

```JavaScript
Box(10).move(1, 2, 3).to(centroid()).gridView();
```

![Image](shape.md.$20.png)

```JavaScript
Box(10, 10, 10).view();
```

![Image](shape.md.$21.png)

```JavaScript
Assembly(Box(5), Arc(5.5).void()).noVoid().gridView();
```

![Image](shape.md.$22.png)

```JavaScript
Box(5).offset(1).gridView();
```

![Image](shape.md.$23.png)

```JavaScript
Box(5).op(color('green')).gridView();
```

![Image](shape.md.$24.png)

```JavaScript
Line([10])
  .orient([40, 50, 0])
  .gridView();
```

![Image](shape.md.$25.png)

```JavaScript
Group(seq(Arc, { from: 1, upto: 20 }))
  .pack()
  .gridView();
```

![Image](shape.md.$26.png)

```JavaScript
Box(1, 2, 3)
  .rx(1 / 8)
  .gridView();
```

![Image](shape.md.$27.png)

```JavaScript
Box(1, 2, 3)
  .ry(1 / 8)
  .gridView();
```

![Image](shape.md.$28.png)

```JavaScript
Box(1, 2, 3)
  .rz(1 / 8)
  .gridView();
```

![Image](shape.md.$29.png)

```JavaScript
Box(5).scale(1, 2).gridView();
```

![Image](shape.md.$30.png)

```JavaScript
Box(5)
  .cut(Arc(4.9).align('x>'))
  .scale(1, 1)
  .gridView();
```

![Image](shape.md.$31.png)

```JavaScript
Box(5)
  .cut(Arc(4.9).align('x>'))
  .scale(-1, 1)
  .gridView();
```

length 1x2x3

```JavaScript
Box(1, 2, 3).size('length', 'width', 'height', (length, width, height) => note(`length ${length}x${width}x${height}`));
```

![Image](shape.md.$33.png)

```JavaScript
Box(2, 2, 2).color('red').and(Box(1, 1, 1).sketch()).view();
```

[object Object]

undefined

```JavaScript
Box(1)
  .as('box')
  .tags((tags) => note(`${tags}`));
```

![Image](shape.md.$35.png)

```JavaScript
Box(5, 5, 5).gridView();
```

![Image](shape.md.$36.png)

```JavaScript
Box(5).tool('laser').gridView();
```

![Image](shape.md.$37.png)

```JavaScript
Assembly(Box(5), Arc(6).void()).gridView();
```

![Image](shape.md.$38.png)

```JavaScript
Box(5).fitTo(Arc(6)).gridView();
```

![Image](shape.md.$39.png)

```JavaScript
Box(5).x(1).gridView();
```

![Image](shape.md.$40.png)

```JavaScript
Box(5).y(1).gridView();
```

![Image](shape.md.$41.png)

```JavaScript
Box(5).z(1).gridView();
```

![Image](shape.md.$42.png)

```JavaScript
Arc(10)
  .op((s) => s.offset(1).fitTo(s.void()))
  .ez([5])
  .view();
```

![Image](shape.md.$43.png)

```JavaScript
Box(10)
  .ez([10])
  .color('green')
  .and(faces().n(4).extrudeAlong(normal(), [1]).tint('red'))
  .view();
```

![Image](shape.md.$44.png)

```JavaScript
Arc(10).color('blue').color('red').view();
```

![Image](shape.md.$45.png)

```JavaScript
Arc(10).color('blue').tint('red').view();
```

![Image](shape.md.$46.png)

```JavaScript
Segments(
  seq(
    (y) => (s) => [[-10, y, 0], [10, y, 0]],
    {
      from: -6,
      upto: 6,
      by: 1 / 4,
    },
    List
  )
)
  .rz(1 / 8)
  .clip(Arc(5).cut(Arc(2)).ez([1, -1]))
  .clean()
  .color('green')
  .gridView();
```

```JavaScript
const b = Box(5)
  .ez([5])
  .and(
    Hershey('A', 3)
      .color('green')
      .z(5 / 2)
  )
  .material('glass')
  .y(10);
```

![Image](shape.md.$47.png)

```JavaScript
b.at(eachEdge().sort(size('maxZ'), 'max', 1).sort(size('minY'), 'min', 1).sort(size('minX'), 'min', 1).n(0).origin(), cut(Box(3, 3, 11))).view();
```

![Image](shape.md.$48.png)

```JavaScript
b.by(eachEdge().sort(size('maxZ'), 'max', 1).sort(size('minY'), 'min', 1).sort(size('minX'), 'min', 1).n(0).origin()).cut(Box(3, 3, 11)).view();
```

![Image](shape.md.$49.png)

```JavaScript
Voxels([0, 0, 0], [0, 0, 1], [1, 0, 1], [2, 0, 1]).view();
```

![Image](shape.md.$50.png)

```JavaScript
Arc(2)
  .ez([5])
  .cut(
    Box(5)
      .ry(1 / 16)
      .ez([5])
      .z(3)
  )
  .simplify({ ratio: 0.1, eps: 0.01 })
  .view();
```

![Image](shape.md.$51_triangle.png)

[triangle.svg](shape.triangle.svg)

```JavaScript
Triangle(14).svg('triangle');
```

![Image](shape.md.$52.png)

![Image](shape.md.$52.png)

```JavaScript
Box(10)
  .ez([50, -50])
  .rx(0, 1 / 4)
  .fuse()
  .view(0)
  .remesh(1, Box(20, 20, 20))
  .smooth({ method: 'shape', iterations: 1, time: 1 }, Box(9, 20, 20))
  .view();
```

![Image](shape.md.$53_1.png)

Original mesh

![Image](shape.md.$53_2.png)

Isotropic remeshing

![Image](shape.md.$53_3.png)

Cut

![Image](shape.md.$53_4.png)

Cleaned mesh

```JavaScript
Box(20, 20, 20)
  .view(1, 'wireframe')
  .note('Original mesh')
  .remesh()
  .view(2, 'wireframe')
  .note('Isotropic remeshing')
  .cut('exact', Box([0, 10], [0, -10], [0, 10]))
  .view(3, 'wireframe')
  .note('Cut')
  .demesh()
  .view(4, 'wireframe')
  .note('Cleaned mesh');
```

![Image](shape.md.$54.png)

```JavaScript
Arc(4)
  .x(5)
  .seq({ by: 1 / 8 }, rz, Join)
  .material('glass')
  .color('orange')
  // .and(toolpath())
  .view();
```

![Image](shape.md.$55_54.png)

```JavaScript
Box(10).cut(Arc(6).x(6, -6), Box(1, 10))
  // .and(toolpath())
  .view(54);
```

![Image](shape.md.$56_60.png)

```JavaScript
Box(20, 20, 20)
  .join(Box(10, 10, 40))
  .rx(1 / 16)
  .material('glass')
  .and(upperEnvelope().color('red'))
  .view(60);
```

Area of Box(2).cut(Box(1)) is function () { [native code] }

Area is 4.00

```JavaScript
Box(2)
  .cut(Box(1))
  .area((v) => (s) => s.note(`Area is ${v.toFixed(2)}`));
```

Area of Box(2, 3, 4) is function () { [native code] }

Volume of Box(2, 3, 4) is function () { [native code] }

![Image](shape.md.c.png)

```JavaScript
const c = Box(10)
  .rx(1 / 8)
  .view();
```

![Image](shape.md.$61.png)

```JavaScript
c.by(origin()).view();
```

![Image](shape.md.$62.png)

```JavaScript
c.by(origin()).and(Box(5, 5, 5)).view();
```

![Image](shape.md.$63.png)

```JavaScript
c.by(origin()).cut(Box(5, 5, 5)).view();
```

![Image](shape.md.$64.png)

```JavaScript
Triangle(4)
  .x(5)
  .at(origin(), rz(1 / 16))
  .view();
```

![Image](shape.md.$65.png)

```JavaScript
Group(Box(), Triangle(1).x(2), Hexagon(1).x(4)).sort(size('left')).view();
```

![Image](shape.md.$66.png)

```JavaScript
Group(Box(), Triangle(1).x(2), Hexagon(1).x(4)).sort(size('right')).view();
```

![Image](shape.md.$67.png)

```JavaScript
Box(5, 5, 20)
  .rx(1 / 4, 1 / 32)
  .wrap(1, 0.1)
  .view();
```

![Image](shape.md.$68.png)

```JavaScript
Box(100).image('https://jsxcad.js.org/png/cooper_2.png').log().topView();
```

![Image](shape.md.$69.png)

```JavaScript
Segments(
  [
    [-18.15, 40.34, 0.0],
    [-9.82, 45.66, 0.0],
  ],
  [
    [-16.91, 42.17, 0.0],
    [13.92, 44.82, 0.0],
  ],
  [
    [-7.05, 43.82, 0.0],
    [26.69, 44.17, 0.0],
  ],
  [
    [10.87, 44.37, 0.0],
    [30.95, 42.04, 0.0],
  ],
  [
    [27.14, 44.17, 0.0],
    [36.46, 33.4, 0.0],
  ],
  [
    [32.65, 36.59, 0.0],
    [41.01, 31.89, 0.0],
  ],
  [
    [37.65, 36.13, 0.0],
    [41.54, 23.4, 0.0],
  ],
  [
    [41.8, 27.95, 0.0],
    [32.31, 22.32, 0.0],
  ],
  [
    [35.45, 27.34, 0.0],
    [32.49, 19.13, 0.0],
  ],
  [
    [35.49, 22.78, 0.0],
    [26.58, 16.06, 0.0],
  ],
  [
    [30.98, 18.21, 0.0],
    [22.45, 18.34, 0.0],
  ],
  [
    [25.05, 17.89, 0.0],
    [17.39, 24.13, 0.0],
  ],
  [
    [23.35, 20.63, 0.0],
    [-27.6, 21.31, 0.0],
  ],
  [
    [-21.39, 23.32, 0.0],
    [-28.85, 17.3, 0.0],
  ],
  [
    [-24.18, 19.16, 0.0],
    [-34.62, 18.52, 0.0],
  ],
  [
    [-31.34, 17.76, 0.0],
    [-38.2, 21.91, 0.0],
  ],
  [
    [-34.61, 21.3, 0.0],
    [-46.18, 22.21, 0.0],
  ],
  [
    [-43.37, 20.97, 0.0],
    [-42.86, 35.32, 0.0],
  ],
  [
    [-44.44, 28.39, 0.0],
    [-39.27, 34.39, 0.0],
  ],
  [
    [-41.93, 32.08, 0.0],
    [-17.37, 36.51, 0.0],
  ],
  [
    [-20.62, 35.14, 0.0],
    [-17.37, 41.56, 0.0],
  ]
)
  .fill()
  .topView();
```

![Image](shape.md.$70.png)

```JavaScript
Arc(37).cut(inset(2)).ez([2]).remesh(1).smooth(Box(50, 10, 20)).view();
```

![Image](shape.md.$71.png)

```JavaScript
Box(4, 4, 4).cutOut(X(0)).view();
```

![Image](shape.md.$72.png)

```JavaScript
Box(4, 4, 4).cut('open', Box(2, 2, 8)).view();
```

![Image](shape.md.$73.png)

```JavaScript
Box(4, 4, 4).clip('open', Box(2, 2, 8)).view();
```

![Image](shape.md.$74.png)

```JavaScript
Loft(Box(3).cut(Arc(2)), Hexagon(3).cut(Arc(2)).z(10)).view();
```

![Image](shape.md.$75.png)

```JavaScript
Loft('open', Box(3).cut(Arc(2)), Hexagon(3).cut(Arc(2)).z(10)).view();
```

![Image](shape.md.$76.png)

```JavaScript
Orb(5, 5, 5, { zag: 5 })
  .eachEdge((e, l) => Box([0, 0.1], [0, 0.1], [0, l * 0.75]).to)
  .view();
```

![Image](shape.md.$77.png)

```JavaScript
Box(4).fit(Arc(6).void()).ez([1]).view();
```

![Image](shape.md.$78.png)

```JavaScript
Box(4).fit(Arc(6).void()).ez([1], 'noVoid').view();
```

![Image](shape.md.$79.png)

```JavaScript
Box(4).fitTo(Arc(4).void()).cut(Hexagon(3)).clean().view();
```

![Image](shape.md.$80.png)

```JavaScript
Box(4).fitTo(Arc(4).void()).cut(Hexagon(3), 'noVoid').clean().view();
```

![Image](shape.md.$81.png)

```JavaScript
Box(4).fitTo(Arc(3).void()).join(Box(1, 5)).clean().view();
```

![Image](shape.md.$82.png)

```JavaScript
Box(4).fitTo(Arc(3).void()).join(Box(1, 5), 'noVoid').clean().view();
```

![Image](shape.md.$83.png)

```JavaScript
Box(4).fitTo(Arc(3).void()).clip(Box(1, 5)).clean().view();
```

![Image](shape.md.$84.png)

```JavaScript
Box(4).fitTo(Arc(3).void()).clip(Box(1, 5), 'noVoid').clean().view();
```

![Image](shape.md.$85.png)

```JavaScript
Box(10, 10, 10)
  .and(
    eachEdge(
      (e, l) => Box([0, 1.5], 0, [0, l])
        .and(
          Arc([1, 2], 1, [0, l * 0.95], { start: 1 / 4, end: 3 / 4 })
            .y(1)
        )
        .to(e)
    )
  )
  .view();
```

![Image](shape.md.$86.png)

```JavaScript
Point().view();
```

```JavaScript
const xy = Box(20, 30).cut(Box(10)).to(XY());
```

```JavaScript
const xz = Arc(20, 30).cut(Pentagon(7)).to(XZ());
```

```JavaScript
const yz = Arc(20, 20).cut(Triangle(5)).to(YZ());
```

![Image](shape.md.$87.png)

```JavaScript
Group(xy, xz, yz)
  .clean()
  .each(e(diameter()))
  .commonVolume()
  .clean()
  .and(
    xy.e(50).color('red').ghost(),
    xz.e(50).color('green').ghost(),
    yz.e(50).color('blue').ghost()
  )
  .view();
```
