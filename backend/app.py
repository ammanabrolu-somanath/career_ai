from flask import Flask, jsonify, request
from flask_cors import CORS

from data.careers import CAREERS
from data.student_profiles import get_student_profile
from services.graph_algorithms import bfs_traversal, dfs_traversal
from services.hashing_benchmark import BENCHMARK_DATASET_SIZES, run_hashing_benchmark
from services.recommendation_engine import recommend_careers
from services.validation import validate_profile

app = Flask(__name__)
CORS(app)


def _get_json_body():
    """
    Safely reads the request's JSON body.
    Returns (data, error_response). error_response is None on success,
    or a ready-to-return (jsonify(...), status_code) tuple on failure -
    this route never lets a bad request crash the server.
    """
    if not request.data:
        return None, (jsonify({"success": False, "error": "Request body is empty. A JSON profile is required."}), 400)

    try:
        data = request.get_json(force=False, silent=False)
    except Exception:
        return None, (jsonify({"success": False, "error": "Request body is not valid JSON."}), 400)

    if not isinstance(data, dict):
        return None, (jsonify({"success": False, "error": "Request body must be a JSON object."}), 400)

    return data, None


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "AI-Based Smart Career Guidance System backend is running"
    })


@app.route("/api/validate", methods=["POST"])
def validate_profile_route():
    profile, error_response = _get_json_body()
    if error_response:
        return error_response

    result = validate_profile(profile)
    return jsonify(result), 200


@app.route("/api/recommend", methods=["POST"])
def recommend_route():
    profile, error_response = _get_json_body()
    if error_response:
        return error_response

    result = recommend_careers(profile)
    status_code = 200 if result["success"] else 400
    return jsonify(result), status_code


@app.route("/api/student/<student_id>", methods=["GET"])
def get_student_route(student_id):
    profile = get_student_profile(student_id)  # O(1) average hash-table lookup
    if profile is None:
        return jsonify({"success": False, "error": "Student profile not found"}), 404
    return jsonify({"success": True, "profile": profile}), 200


@app.route("/api/hashing/benchmark", methods=["GET"])
def hashing_benchmark_route():
    """
    Session 7: real, measured sequential-search-vs-dictionary-lookup
    timing comparison, run on a synthetic dataset (never the real
    STUDENTS data). Optional ?size=<n> runs a single dataset size;
    otherwise every size in BENCHMARK_DATASET_SIZES is run.
    """
    size_param = request.args.get("size")

    if size_param is None:
        results = run_hashing_benchmark()
        return jsonify({"success": True, "results": results}), 200

    try:
        size = int(size_param)
    except ValueError:
        return jsonify({
            "success": False,
            "error": "size must be an integer.",
        }), 400

    if size not in BENCHMARK_DATASET_SIZES:
        return jsonify({
            "success": False,
            "error": f"size must be one of {BENCHMARK_DATASET_SIZES}.",
        }), 400

    results = run_hashing_benchmark([size])
    return jsonify({"success": True, "results": results}), 200


@app.route("/api/careers", methods=["GET"])
def get_careers_route():
    return jsonify({"success": True, "careers": CAREERS}), 200


@app.route("/api/graph/bfs/<node>", methods=["GET"])
def bfs_route(node):
    # Demonstration only - NOT used by /api/recommend. See graph_algorithms.py.
    result = bfs_traversal(node)
    if result is None:
        return jsonify({"success": False, "error": f'"{node}" was not found in the graph.'}), 404
    return jsonify({"success": True, **result}), 200


@app.route("/api/graph/dfs/<node>", methods=["GET"])
def dfs_route(node):
    # Demonstration only - NOT used by /api/recommend. See graph_algorithms.py.
    result = dfs_traversal(node)
    if result is None:
        return jsonify({"success": False, "error": f'"{node}" was not found in the graph.'}), 404
    return jsonify({"success": True, **result}), 200


@app.errorhandler(404)
def handle_404(_error):
    return jsonify({"success": False, "error": "Resource not found"}), 404


@app.errorhandler(405)
def handle_405(_error):
    return jsonify({"success": False, "error": "Method not allowed for this endpoint"}), 405


@app.errorhandler(500)
def handle_500(_error):
    return jsonify({"success": False, "error": "An unexpected server error occurred"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
