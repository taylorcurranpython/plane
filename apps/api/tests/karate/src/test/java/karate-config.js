function fn() {
  function fromEnv(name, fallback) {
    var value = java.lang.System.getenv(name);
    return value ? value : fallback;
  }

  var env = karate.env || fromEnv('KARATE_ENV', 'local');

  var config = {
    env: env,
    baseUrl: fromEnv('KARATE_BASE_URL', 'http://localhost:8000'),
    apiKey: fromEnv('KARATE_API_KEY', 'plane_api_karate_local_only_do_not_use_in_prod'),
    workspaceSlug: fromEnv('KARATE_WORKSPACE_SLUG', 'karate'),
    userEmail: fromEnv('KARATE_USER_EMAIL', 'karate@plane.local'),
    // Unique suffix per run so resource names never collide on a reused database.
    runId: java.util.UUID.randomUUID().toString().substring(0, 8),
  };

  // Django requires the trailing slash on every route (POST without it 404s /
  // 500s instead of redirecting), so every URL built here ends with '/'.
  config.apiV1 = config.baseUrl + '/api/v1/';
  config.workspaceUrl = config.apiV1 + 'workspaces/' + config.workspaceSlug + '/';
  config.authHeaders = { 'X-API-Key': config.apiKey, 'Content-Type': 'application/json' };

  // Commonly reused schema fragments.
  config.uuid = '#regex [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  config.isoDateTime = '#regex \\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*';
  config.paginatedSchema = {
    total_count: '#number',
    next_cursor: '#string',
    prev_cursor: '#string',
    next_page_results: '#boolean',
    prev_page_results: '#boolean',
    count: '#number',
    total_pages: '#number',
    total_results: '#number',
    results: '#array',
  };

  karate.configure('connectTimeout', 10000);
  karate.configure('readTimeout', 30000);
  karate.configure('ssl', false);
  if (env === 'docker' || env === 'ci') {
    karate.configure('logPrettyRequest', false);
    karate.configure('logPrettyResponse', false);
  }

  // A project shared by every feature; created once per JVM via callSingle.
  config.project = karate.callSingle('classpath:plane/common/setup-project.feature', config).project;
  config.projectUrl = config.workspaceUrl + 'projects/' + config.project.id + '/';

  return config;
}
