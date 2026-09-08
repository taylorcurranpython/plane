@ignore
Feature: Shared fixture - create one project for the whole run

  Called once per JVM from karate-config.js via callSingle. Every other feature
  reads the resulting `project` variable from config instead of creating its own.

  Scenario: Create the shared project
    * def suffix = runId.substring(0, 6).toUpperCase()
    * def payload =
      """
      {
        "name": "#('Karate Shared ' + runId)",
        "identifier": "#('KS' + suffix)",
        "description": "Project shared by the Karate behaviour suite",
        "network": 2,
        "cycle_view": true,
        "module_view": true,
        "issue_views_view": true,
        "page_view": true,
        "intake_view": true
      }
      """
    Given url workspaceUrl + 'projects/'
    And headers authHeaders
    And request payload
    When method post
    Then status 201
    And match response.id == '#(uuid)'
    And match response.identifier == payload.identifier
    * def project = response
