@states
Feature: Workflow states

  Every new project starts with the default workflow (Backlog, Todo, In Progress,
  Done, Cancelled). Teams can add their own states, promote one to the default,
  and the internal Triage state can never be created through the API.

  Background:
    * configure headers = authHeaders
    * def statesUrl = projectUrl + 'states/'

  Scenario: A new project has the default workflow states
    Given url statesUrl
    When method get
    Then status 200
    And match response contains paginatedSchema
    * def names = karate.map(response.results, function(s){ return s.name })
    And match names contains ['Backlog', 'Todo', 'In Progress', 'Done', 'Cancelled']
    And match names !contains 'Triage'
    * def groups = karate.map(response.results, function(s){ return s.group })
    And match groups contains ['backlog', 'unstarted', 'started', 'completed', 'cancelled']
    * def backlog = karate.filter(response.results, function(s){ return s.name == 'Backlog' })
    And match backlog[0].default == true

  Scenario: Create, update and delete a custom state
    * def payload = { name: '#("In Review " + runId)', color: '#8B5CF6', group: 'started', description: 'Waiting on code review' }
    Given url statesUrl
    And request payload
    When method post
    # Unlike the other resources the state endpoint answers 200 on create.
    Then status 200
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        color: '#(payload.color)',
        group: 'started',
        description: '#(payload.description)',
        default: false,
        is_triage: false,
        sequence: '#number',
        slug: '#string',
        project: '#(project.id)',
        workspace: '#(uuid)',
        created_by: '#(uuid)',
        created_at: '#(isoDateTime)',
        updated_at: '#(isoDateTime)'
      }
      """
    * def stateId = response.id

    Given url statesUrl + stateId + '/'
    When method get
    Then status 200
    And match response.id == stateId

    Given url statesUrl + stateId + '/'
    And request { name: '#("Reviewing " + runId)', color: '#EC4899' }
    When method patch
    Then status 200
    And match response.name == 'Reviewing ' + runId
    And match response.color == '#EC4899'

    Given url statesUrl + stateId + '/'
    When method delete
    Then status 204

    Given url statesUrl + stateId + '/'
    When method get
    Then status 404

  Scenario: The triage group is reserved and cannot be created
    Given url statesUrl
    And request { name: '#("Sneaky triage " + runId)', color: '#000000', group: 'triage' }
    When method post
    Then status 400
    And match response.non_field_errors[0] contains 'triage'

  Scenario: A state requires a name and a colour
    Given url statesUrl
    And request { group: 'started' }
    When method post
    Then status 400
    And match response == { name: '#[1]', color: '#[1]' }

  Scenario: An unknown state group is rejected
    Given url statesUrl
    And request { name: '#("Nope " + runId)', color: '#000000', group: 'not-a-group' }
    When method post
    Then status 400
    And match response.group == '#[1]'
