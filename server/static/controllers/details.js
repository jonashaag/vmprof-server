angular.module('vmprof.controllers', [])
.controller('details', function ($scope, $http, $routeParams, $timeout,
                                 $location) {
    angular.element('svg').remove();

    if ($scope.log) {
        display_log($scope, $routeParams, $timeout, $location);
        return;
    }
    $scope.loading = true;

    $http.get('/api/log/' + $routeParams.log + '/', {cache: true}
        ).then(function (response) {
            $scope.log = response.data;
            $scope.stats = new Stats(response.data.data);
            display_log($scope, $routeParams, $timeout, $location);
    });
});

function display_log($scope, $routeParams, $timeout, $location) {
    $scope.visualization = $routeParams.view || 'flames';

    $timeout(function () {
        $('[data-toggle=tooltip]').tooltip();
        var height = 800; //$('.table').height();
        var $visualization = $("#visualization");
        if ($visualization.length < 1)
            return;
        $scope.visualizationChange = function(visualization) {
            $scope.visualization = visualization;
            var stats = $scope.stats;
            if (visualization == 'list') {
                Visualization.listOfFunctions(
                    $("#visualization"),
                    height, $scope, $location,
                    stats.VM, true
                );
            }
            if (visualization == 'function-details') {
                Visualization.functionDetails($("#visualization"),
                    height, $routeParams.func_addr, $scope, $location);
            }
            if (visualization == 'list-2') {
                Visualization.listOfFunctions(
                    $("#visualization"),
                    height, $scope, $location,
                    stats.VM, false
                );
            }
            if (visualization == 'flames') {
                var d = stats.getProfiles($routeParams.id);
                $scope.root = d.root;
                var cutoff = d.root.total / 100;
                var addresses = $routeParams.id;
                var path_so_far;
                $scope.total_time = stats.allStats[d.root.addr].total / stats.nodes.total;
                $scope.self_time = stats.allStats[d.root.addr].self / stats.nodes.total;
                $scope.node_total_time = d.root.total / stats.nodes.total;
                $scope.node_self_time = d.root.self / stats.nodes.total;
                $scope.paths = d.paths;

                if (addresses) {
                    path_so_far = addresses.split(",");
                } else {
                    path_so_far = [];
                }
                Visualization.flameChart(
                    $("#visualization"),
                    height,
                    d.root,
                    $scope, $location,
                    cutoff, path_so_far,
                    stats.VM
                );
            }
        };

        $scope.visualizationChange($scope.visualization);
    });
    $scope.loading = false;
}
