#include <CGAL/Exact_predicates_exact_constructions_kernel.h>
#include <CGAL/Polygon_mesh_processing/clip.h>
#include <CGAL/Polygon_mesh_processing/orientation.h>

#include "Geometry.h"
#include "boolean_util.h"
#include "segment_util.h"

static int Cut(Geometry* geometry, size_t targets, bool open, bool exact) {
  typedef CGAL::Exact_predicates_exact_constructions_kernel EK;
  typedef CGAL::Surface_mesh<EK::Point_3> Surface_mesh;

  size_t size = geometry->size();
  geometry->copyInputMeshesToOutputMeshes();
  geometry->copyInputSegmentsToOutputSegments();
  geometry->copyInputPointsToOutputPoints();
  geometry->transformToAbsoluteFrame();
  geometry->convertPlanarMeshesToPolygons();
  geometry->copyPolygonsWithHolesToGeneralPolygonSets();
  geometry->computeBounds();

  for (size_t target = 0; target < targets; target++) {
    switch (geometry->type(target)) {
      case GEOMETRY_MESH: {
        if (geometry->is_empty_mesh(target)) {
          // Nothing to cut.
          continue;
        }
        for (size_t nth = targets; nth < size; nth++) {
          if (geometry->is_reference(nth)) {
            Plane plane(0, 0, 1, 0);
            plane = plane.transform(geometry->transform(nth));
            if (!CGAL::Polygon_mesh_processing::clip(
                    geometry->mesh(target), plane.opposite(),
                    CGAL::parameters::use_compact_clipper(true).clip_volume(
                        open == false))) {
              return STATUS_ZERO_THICKNESS;
            }
            continue;
          }
          if (!geometry->is_mesh(nth) || geometry->is_empty_mesh(nth) ||
              geometry->noOverlap3(target, nth)) {
            continue;
          }
          assert(cut_mesh_by_mesh(geometry->mesh(target), geometry->mesh(nth),
                                  open, exact));
          geometry->updateBounds3(target);
        }
        demesh(geometry->mesh(target));
        break;
      }
      case GEOMETRY_POLYGONS_WITH_HOLES: {
        for (size_t nth = targets; nth < size; nth++) {
          switch (geometry->getType(nth)) {
            case GEOMETRY_POLYGONS_WITH_HOLES: {
              if (geometry->plane(target) != geometry->plane(nth) ||
                  geometry->noOverlap2(target, nth)) {
                continue;
              }
              geometry->gps(target).difference(geometry->gps(nth));
              geometry->updateBounds2(target);
              break;
            }
            case GEOMETRY_MESH: {
              Polygons_with_holes_2 pwhs;
              SurfaceMeshSectionToPolygonsWithHoles(
                  geometry->mesh(nth), geometry->plane(target), pwhs);
              for (const Polygon_with_holes_2& pwh : pwhs) {
                geometry->gps(target).difference(pwh);
              }
              geometry->updateBounds2(target);
              break;
            }
          }
        }
        break;
      }
      case GEOMETRY_SEGMENTS: {
        // TODO: Support disjunction by PolygonsWithHoles.
        std::vector<Segment> in;
        geometry->segments(target).swap(in);
        std::vector<Segment> out;
        for (size_t nth = targets; nth < size; nth++) {
          switch (geometry->getType(nth)) {
            case GEOMETRY_MESH: {
              std::cout << "clip: segment vs mesh" << std::endl;
              std::vector<EK::Segment_3> out;
              if (geometry->is_empty_mesh(nth)) {
                continue;
              }
              AABB_tree& tree = geometry->aabb_tree(nth);
              Side_of_triangle_mesh& on_side = geometry->on_side(nth);
              for (const Segment& segment : in) {
                cut_segment_with_volume(segment, tree, on_side, out);
              }
              in.swap(out);
              out.clear();
              break;
            }
            case GEOMETRY_SEGMENTS: {
              // TODO: Support segment / segment cuts.
              break;
            }
            case GEOMETRY_POLYGONS_WITH_HOLES: {
              const auto& transform = geometry->transform(nth);
              const auto inverse = transform.inverse();
              const EK::Plane_3 zero(EK::Point_3(0, 0, 0),
                                     EK::Vector_3(0, 0, 1));
              std::vector<EK::Segment_2> o2s;
              for (const EK::Segment_3& s3 : in) {
                EK::Segment_2 s2(zero.to_2d(s3.source().transform(inverse)),
                                 zero.to_2d(s3.target().transform(inverse)));
                clip_segment_with_pwh(s2, geometry->pwh(nth), o2s);
              }
              std::vector<EK::Segment_3> o3s;
              for (const auto& o2 : o2s) {
                o3s.emplace_back(zero.to_3d(o2.source()).transform(transform),
                                 zero.to_3d(o2.target()).transform(transform));
              }
              in.swap(o3s);
              geometry->segments(target).swap(in);
              break;
            }
          }
        }
        geometry->segments(target).swap(in);
        break;
      }
      case GEOMETRY_POINTS: {
        std::vector<EK::Point_3> in;
        geometry->points(target).swap(in);
        std::vector<EK::Point_3> out;
        for (size_t nth = targets; nth < size; nth++) {
          if (!geometry->is_mesh(nth) || geometry->is_empty_mesh(nth)) {
            continue;
          }
          auto& on_side = geometry->on_side(nth);
          for (const auto& point : in) {
            if (on_side(point) == CGAL::ON_UNBOUNDED_SIDE) {
              out.push_back(point);
            }
          }
          in.swap(out);
          out.clear();
        }
        geometry->points(target).swap(in);
        break;
      }
      case GEOMETRY_UNKNOWN: {
        std::cout << "Unknown type for Cut at " << target << std::endl;
        return STATUS_INVALID_INPUT;
      }
      case GEOMETRY_REFERENCE:
      case GEOMETRY_EDGES:
      case GEOMETRY_EMPTY:
        break;
    }
  }

  geometry->resize(targets);
  geometry->removeEmptyMeshes();
  geometry->copyGeneralPolygonSetsToPolygonsWithHoles();
  geometry->convertPlanarMeshesToPolygons();
  geometry->transformToLocalFrame();

  return STATUS_OK;
}
