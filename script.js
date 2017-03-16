// Code goes here
(function() {
  'use strict'

  var testApp = angular.module('testApp', ['ui.router', 'ui.bootstrap']);

  testApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/home");

    $stateProvider.state('main', {
      url: '/home',
      templateUrl: 'main.html',
      controller: 'MainCtrl'
    });
  }]);

  testApp.constant("DefaultUnflattenedObjectConstant", {
    firstName: 'John',
    lastName: 'Green',
    car: {
      make: 'Honda',
      model: 'Civic',
      revisions: [{
        miles: 10150,
        code: 'REV01',
        changes: null
      }, {
        miles: 20021,
        code: 'REV02',
        changes: [{
          type: 'asthetic',
          desc: 'Left tire cap'
        }, {
          type: 'mechanic',
          desc: 'Engine pressure regulator'
        }]
      }]
    },
    visits: [{
      date: '2015-01-01',
      dealer: 'DEAL-001'
    }, {
      date: '2015-03-01',
      dealer: 'DEAL-002'
    }]
  });

  testApp.controller('MainCtrl', ['ObjectFormattingService', 'DefaultUnflattenedObjectConstant', '$scope', 'jsonSerializationService',
    function(ObjectFormattingService, DefaultUnflattenedObjectConstant, $scope, jsonSerializationService) {

      $scope.flattenObject = function() {
        var result = ObjectFormattingService.flattenObject(jsonSerializationService.parse($scope.unflattenedObject));
        $scope.flattenedObject = jsonSerializationService.stringify(result);
        $scope.unflattenedObject = null;
      };

      $scope.unflattenObject = function() {
        var result = ObjectFormattingService.unflattenObject(jsonSerializationService.parse($scope.flattenedObject));
        $scope.unflattenedObject = jsonSerializationService.stringify(result);
        $scope.flattenedObject = null;
      };

      $scope.reset = function() {
        $scope.unflattenedObject = jsonSerializationService.stringify(DefaultUnflattenedObjectConstant);
        $scope.flattenedObject = null;
      }

      $scope.reset();

    }
  ]);

  testApp.service('jsonSerializationService', [function() {
    
    return {
      stringify: function(objectToSerialize) {
        return JSON.stringify(objectToSerialize);
      },
      parse: function(json) {
        return JSON.parse(json);
      }
    }
  }]);

  testApp.service('ObjectFormattingService', [function() {

    return {
      flattenObject: function(unflattenedObject) {
        var result = {};

        function flatten(currentLevel, property) {
          if (Object(currentLevel) !== currentLevel) {
            result[property] = currentLevel;
          } else if (Array.isArray(currentLevel)) {
            for (var i = 0, l = currentLevel.length; i < l; i++)
              flatten(currentLevel[i], property ? property + "." + i : "" + i);
            if (l === 0)
              result[property] = [];
          } else {
            var isEmpty = true;
            for (var p in currentLevel) {
              isEmpty = false;
              flatten(currentLevel[p], property ? property + "." + p : p);
            }
            if (isEmpty)
              result[property] = {};
          }
        }

        flatten(unflattenedObject, "");
        return result;
      },
      unflattenObject: function(flattenedObject) {
        if (Object(flattenedObject) !== flattenedObject || Array.isArray(flattenedObject)) {
          return flattenedObject;
        }

        var result = {}, currentLevel, property, objectProperties, index;
        for (var p in flattenedObject) {
          currentLevel = result, property = "";
          objectProperties = p.split(".");
          for (var i = 0; i < objectProperties.length; i++) {
            index = !isNaN(parseInt(objectProperties[i]));
            currentLevel = currentLevel[property] || (currentLevel[property] = (index ? [] : {}));
            property = objectProperties[i];
          }
          currentLevel[property] = flattenedObject[p];
        }

        return result[""];
      }
    }
  }]);
})();