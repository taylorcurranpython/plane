@work-items
Feature: Work items

  Work items (issues) are the core unit of work. Each one gets a sequential id
  within its project, lands in the project's default state, and can carry
  labels, comments, links and an activity trail.

  Background:
    * configure headers = authHeaders
    * def workItemsUrl = projectUrl + 'work-items/'

  Scenario: Create, read, update and delete a work item
    * def payload = { name: '#("Karate item " + runId)', description_html: '<p>Created by Karate</p>', priority: 'high' }
    Given url workItemsUrl
    And request payload
    When method post
    Then status 201
    And match response contains
      """
      {
        id: '#(uuid)',
        name: '#(payload.name)',
        description_html: '#(payload.description_html)',
        priority: 'high',
        sequence_id: '#number',
        state: '#(uuid)',
        project: '#(project.id)',
        workspace: '#(uuid)',
        assignees: [],
        labels: [],
        parent: null,
        completed_at: null,
        archived_at: null,
        is_draft: false,
        created_by: '#(uuid)',
        created_at: '#(isoDateTime)',
        updated_at: '#(isoDateTime)'
      }
      """
    * def workItemId = response.id
    * def sequenceId = response.sequence_id

    Given url workItemsUrl + workItemId + '/'
    When method get
    Then status 200
    And match response.id == workItemId
    And match response.sequence_id == sequenceId

    Given url workItemsUrl + workItemId + '/'
    And request { name: '#("Karate item renamed " + runId)', priority: 'low' }
    When method patch
    Then status 200
    And match response.name == 'Karate item renamed ' + runId
    And match response.priority == 'low'
    And match response.updated_by == '#(uuid)'

    Given url workItemsUrl + workItemId + '/'
    When method delete
    Then status 204

    Given url workItemsUrl + workItemId + '/'
    When method get
    Then status 404

  Scenario: A new work item lands in the project's default state
    Given url projectUrl + 'states/'
    When method get
    Then status 200
    * def defaultState = karate.filter(response.results, function(s){ return s.default })[0]

    Given url workItemsUrl
    And request { name: '#("Default state " + runId)' }
    When method post
    Then status 201
    And match response.state == defaultState.id
    * def workItemId = response.id

    Given url workItemsUrl + workItemId + '/'
    When method delete
    Then status 204

  Scenario: A work item can be looked up by its human readable identifier
    Given url workItemsUrl
    And request { name: '#("Identifier lookup " + runId)' }
    When method post
    Then status 201
    * def workItemId = response.id
    * def sequenceId = response.sequence_id

    Given url workspaceUrl + 'work-items/' + project.identifier + '-' + sequenceId + '/'
    When method get
    Then status 200
    And match response.id == workItemId
    And match response.name == 'Identifier lookup ' + runId

    Given url workItemsUrl + workItemId + '/'
    When method delete
    Then status 204

  Scenario: Work items can be created with labels attached
    Given url projectUrl + 'labels/'
    And request { name: '#("wi-label-" + runId)', color: '#0EA5E9' }
    When method post
    Then status 201
    * def labelId = response.id

    Given url workItemsUrl
    And request { name: '#("Labelled " + runId)', labels: ['#(labelId)'] }
    When method post
    Then status 201
    And match response.labels == [ '#(labelId)' ]
    * def workItemId = response.id

    Given url workItemsUrl + workItemId + '/'
    When method delete
    Then status 204
    Given url projectUrl + 'labels/' + labelId + '/'
    When method delete
    Then status 204

  Scenario: Comments and links can be attached to a work item
    Given url workItemsUrl
    And request { name: '#("With comments " + runId)' }
    When method post
    Then status 201
    * def workItemId = response.id

    Given url workItemsUrl + workItemId + '/comments/'
    And request { comment_html: '<p>Looks good to me</p>' }
    When method post
    Then status 201
    And match response contains { id: '#(uuid)', comment_html: '<p>Looks good to me</p>', issue: '#(workItemId)', actor: '#(uuid)', access: 'INTERNAL' }
    * def commentId = response.id

    Given url workItemsUrl + workItemId + '/comments/'
    When method get
    Then status 200
    And match response.results[*].id contains commentId

    Given url workItemsUrl + workItemId + '/links/'
    And request { url: '#("https://example.com/karate/" + runId)', title: 'Karate link' }
    When method post
    Then status 201
    And match response contains { id: '#(uuid)', url: '#("https://example.com/karate/" + runId)', title: 'Karate link', issue: '#(workItemId)' }

    Given url workItemsUrl + workItemId + '/activities/'
    When method get
    Then status 200
    And match response contains paginatedSchema

    Given url workItemsUrl + workItemId + '/'
    When method delete
    Then status 204

  Scenario: Listing work items is paginated
    Given url workItemsUrl
    And param per_page = 5
    When method get
    Then status 200
    And match response contains paginatedSchema
    And match response.results == '#[_ <= 5]'

  Scenario: A work item requires a name
    Given url workItemsUrl
    And request { priority: 'medium' }
    When method post
    Then status 400
    And match response.name == '#[1]'

  Scenario: Priority must be one of the known values
    Given url workItemsUrl
    And request { name: '#("Bad priority " + runId)', priority: 'critical' }
    When method post
    Then status 400
    And match response.priority[0] contains 'not a valid choice'

  Scenario: Reading a work item that does not exist returns 404
    Given url workItemsUrl + '00000000-0000-4000-8000-000000000000/'
    When method get
    Then status 404
