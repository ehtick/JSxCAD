#pragma once

#define CGAL_EIGEN3_ENABLED

#include <CGAL/Cartesian_converter.h>
#include <CGAL/Mean_curvature_flow_skeletonization.h>
#include <CGAL/Simple_cartesian.h>
#include <CGAL/Surface_mesh.h>
#include <CGAL/create_straight_skeleton_2.h>
#include <CGAL/extract_mean_curvature_flow_skeleton.h>

static int ComputeSkeleton(Geometry* geometry) {
  try {
    size_t size = geometry->size();
    geometry->copyInputMeshesToOutputMeshes();
    geometry->transformToAbsoluteFrame();
    geometry->convertPolygonsToPlanarMeshes();
    for (int nth = 0; nth < size; nth++) {
      switch (geometry->getType(nth)) {
        case GEOMETRY_MESH: {
          Cartesian_surface_mesh cartesian_mesh;
          copy_face_graph(geometry->mesh(nth), cartesian_mesh);
          CGAL::Mean_curvature_flow_skeletonization<
              Cartesian_surface_mesh>::Skeleton skeleton;
          CGAL::extract_mean_curvature_flow_skeleton(cartesian_mesh, skeleton);
          std::cout << "Number of vertices of the skeleton: "
                    << boost::num_vertices(skeleton) << "\n";
          std::cout << "Number of edges of the skeleton: "
                    << boost::num_edges(skeleton) << "\n";
          CGAL::Cartesian_converter<Cartesian_kernel, Epeck_kernel> to_epeck;
          int segments = geometry->add(GEOMETRY_SEGMENTS);
          for (const auto& e : CGAL::make_range(edges(skeleton))) {
            geometry->addSegment(
                segments,
                Segment(to_epeck(skeleton[source(e, skeleton)].point),
                        to_epeck(skeleton[target(e, skeleton)].point)));
          }
        }
      }
    }
    geometry->transformToLocalFrame();
    return STATUS_OK;
  } catch (const std::exception& e) {
    std::cout << "QQ/EachPoint/exception" << std::endl;
    std::cout << e.what() << std::endl;
    throw;
  }
}