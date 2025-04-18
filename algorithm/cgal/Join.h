#include <CGAL/Exact_predicates_exact_constructions_kernel.h>

#include "Geometry.h"
#include "boolean_util.h"
#include "segment_util.h"

static int Join(Geometry* geometry, size_t targets, bool exact) {
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
          continue;
        }
        for (size_t nth = targets; nth < size; nth++) {
          if (!geometry->is_mesh(nth)) {
            continue;
          }
          if (geometry->noOverlap3(target, nth)) {
            geometry->mesh(target).join(geometry->mesh(nth));
          } else {
            assert(join_mesh_to_mesh(geometry->mesh(target),
                                     geometry->mesh(nth), exact));
          }
          geometry->updateBounds3(target);
        }
        demesh(geometry->mesh(target));
        break;
      }
      case GEOMETRY_POLYGONS_WITH_HOLES: {
        for (size_t nth = targets; nth < size; nth++) {
          switch (geometry->getType(nth)) {
            case GEOMETRY_POLYGONS_WITH_HOLES: {
              if (geometry->plane(target) != geometry->plane(nth)) {
                continue;
              }
              geometry->gps(target).join(geometry->gps(nth));
              geometry->updateBounds2(target);
              break;
            }
            case GEOMETRY_MESH: {
              Polygons_with_holes_2 pwhs;
              SurfaceMeshSectionToPolygonsWithHoles(
                  geometry->mesh(nth), geometry->plane(target), pwhs);
              for (const auto& pwh : pwhs) {
                geometry->gps(target).join(pwh);
              }
              geometry->updateBounds2(target);
              break;
            }
          }
        }
        break;
      }
      case GEOMETRY_SEGMENTS: {
        for (size_t nth = targets; nth < size; nth++) {
          if (!geometry->has_segments(nth)) {
            continue;
          }
          for (const auto& segment : geometry->segments(nth)) {
            geometry->addSegment(target, segment);
          }
        }
        break;
      }
      case GEOMETRY_POINTS: {
        for (size_t nth = targets; nth < size; nth++) {
          if (!geometry->has_points(nth)) {
            continue;
          }
          for (const auto& point : geometry->points(nth)) {
            geometry->addPoint(target, point);
          }
        }
        break;
      }
      case GEOMETRY_UNKNOWN: {
        std::cout << "Unknown type for Join at " << target << std::endl;
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
  geometry->transformToLocalFrame();

  return STATUS_OK;
}
