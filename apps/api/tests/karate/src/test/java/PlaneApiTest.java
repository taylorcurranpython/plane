// Copyright (c) 2023-present Plane Software, Inc. and contributors
// SPDX-License-Identifier: AGPL-3.0-only
// See the LICENSE file for details.

import com.intuit.karate.Results;
import com.intuit.karate.Runner;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Entry point for the Karate suite. Runs every feature under {@code classpath:plane}
 * in parallel and fails the build if any scenario fails.
 *
 * Narrow the run with {@code -Dkarate.options="--tags @projects"} or
 * {@code -Dkarate.options="classpath:plane/workitems"}.
 */
class PlaneApiTest {

  @Test
  void runAllFeatures() {
    Results results = Runner.path("classpath:plane")
        .outputCucumberJson(true)
        .outputJunitXml(true)
        .parallel(threads());
    assertEquals(0, results.getFailCount(), results.getErrorMessages());
  }

  private static int threads() {
    String value = System.getProperty("karate.threads", System.getenv("KARATE_THREADS"));
    if (value == null || value.isBlank()) {
      return 4;
    }
    return Integer.parseInt(value.trim());
  }
}
