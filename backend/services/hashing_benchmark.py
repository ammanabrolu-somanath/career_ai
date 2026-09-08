"""
Session 7: "Correctness of hash-based profile storage with timing comparison."

This module runs a REAL, measured comparison between sequential (list)
search and Python dictionary (hash) lookup, entirely on its own synthetic
dataset - it never reads, writes, or otherwise touches
backend/data/student_profiles.py or the real STUDENTS dictionary. Every
number this module returns comes from an actual time.perf_counter()
measurement taken while this request runs; nothing is invented or
hard-coded.

This is a different, backend-measured counterpart to the existing
client-side (JavaScript, in-browser) illustrative benchmark on the System
Testing page - that one simulates the general principle in the browser
because the real STUDENTS dict is too small to show a difference; this one
measures real Python list-vs-dict behavior on the server for the same
reason.
"""

import time

# Kept small and fixed so results are reproducible and directly comparable
# across runs - not user-supplied arbitrary sizes.
BENCHMARK_DATASET_SIZES = [100, 1000, 10000, 100000]

# Fewer iterations at larger sizes keeps the (synchronous) sequential-scan
# timing loop from blocking the single-threaded dev server for too long,
# while still giving enough repetitions for a stable average.
ITERATIONS_BY_SIZE = {
    100: 5000,
    1000: 2000,
    10000: 300,
    100000: 50,
}


def _generate_synthetic_dataset(size):
    """
    Builds `size` synthetic student records for this experiment only.
    Returns a list (for sequential search) and a dict keyed by student_id
    built from the SAME records (for hash lookup), so both structures
    hold identical data.
    """
    records = [
        {"student_id": f"BENCH{i + 1:06d}", "name": f"Synthetic Student {i + 1}"}
        for i in range(size)
    ]
    records_dict = {record["student_id"]: record for record in records}
    return records, records_dict


def run_single_benchmark(size):
    """
    Runs the sequential-vs-hash comparison for one dataset size.

    Fairness notes:
    - Dataset construction happens BEFORE either timed section.
    - The same target_id is looked up by both methods, against the same
      underlying records.
    - The target sits at the very end of the list, so sequential search
      is timed at its true worst case (must scan every record).
    - Only the lookup operation itself is timed - not construction, not
      the Flask/network layer.
    """
    records, records_dict = _generate_synthetic_dataset(size)

    target_id = records[-1]["student_id"]
    target_position = size
    iterations = ITERATIONS_BY_SIZE.get(size, 50)

    # Records examined for a worst-case sequential search is deterministic
    # for a fixed target position, so it is measured once, outside the
    # timed loop, and never affects the measured lookup times.
    records_examined = 0
    for record in records:
        records_examined += 1
        if record["student_id"] == target_id:
            break

    sequential_result = None
    sequential_start = time.perf_counter()
    for _ in range(iterations):
        sequential_result = None
        for record in records:
            if record["student_id"] == target_id:
                sequential_result = record
                break
    sequential_end = time.perf_counter()

    hash_result = None
    hash_start = time.perf_counter()
    for _ in range(iterations):
        hash_result = records_dict.get(target_id)
    hash_end = time.perf_counter()

    sequential_total_time = sequential_end - sequential_start
    hash_total_time = hash_end - hash_start

    results_match = (
        sequential_result is not None
        and hash_result is not None
        and sequential_result["student_id"] == target_id
        and hash_result["student_id"] == target_id
    )

    return {
        "dataset_size": size,
        "target_position": target_position,
        "iterations": iterations,
        "sequential_average_time": sequential_total_time / iterations,
        "hash_average_time": hash_total_time / iterations,
        "sequential_records_examined": records_examined,
        "hash_access_type": "direct key access",
        "results_match": results_match,
    }


def run_hashing_benchmark(sizes=None):
    """
    Runs the benchmark across one or more dataset sizes and returns the
    real, measured results for each.
    """
    sizes_to_run = sizes if sizes else BENCHMARK_DATASET_SIZES
    return [run_single_benchmark(size) for size in sizes_to_run]
