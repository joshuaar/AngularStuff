
var app = angular.module('app', [])

//Where the displayed results go
app.service('results', function($rootScope) {
    var results = {};
    return {
        set : function(newRes){
            results = newRes
            $rootScope.$broadcast("resultsChanged",results)
            console.log(results)
        },
        get : function(){
            return results
        }
    }
})

app.directive('pagination', function() {
    return {
        restrict: "AE",
        template: ['<div class="pagination">',
            '<a href="#{{page}}" ng-click="fst()"><-- </a>',
            '<a href="#{{page}}" ng-click="prev()"> <- </a> | ',
            '<a href="#{{page}}" ng-repeat="page in pages" ng-click="goto(page)">{{page}} | </a>',
            '<a href="#{{page}}" ng-click="next()"> -> </a>',
            '<a href="#{{page}}" ng-click="last()"> --> </a>',
            ' Page: {{page}} ',
            '</div>'
        ].join("\n")

    }
});

//Pagination needs the scope and the results variable


var getPageVector = function(nPages,curpage,maxDisplay) {
    out = []
    if(curpage <= maxDisplay){//if the current page is in the first n pages
        for(var i=1;i<=maxDisplay;i++)out.push(i)
    } else if(curpage > nPages - maxDisplay){//if the current page is in the last n pages
        for(var i=nPages;i>(nPages-maxDisplay);i--)out.push(i)
    } else {//if the current page is in the middle somewhere
        var eachSide = Math.floor(maxDisplay/2)
        for(var i=curpage-1;i>=curpage-eachSide;i--){out.push(i)}
        for(var i = curpage+1;i<=curpage+eachSide;i++)out.push(i)
        out.push(curpage)
    }
    return out.sort(function(a,b){return a-b}).slice(0,Math.min(maxDisplay,nPages))
}

var paginationCtrl = function($scope, results) {
    results.set({"num":100,"page":1,"rng":[1,10]})
    $scope.results = results.get()
    $scope.page = 1
    $scope.resPerPage = 50
    $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
    $scope.pages = getPageVector($scope.nPages,$scope.page,10)
    $scope.$on('resultsChanged', function(event,res){
        $scope.results = res
        $scope.nPages = Math.ceil($scope.results.num / $scope.resPerPage)
    })

    $scope.fst = function(){
        $scope.goto(1)
    }
    $scope.last = function(){

        $scope.goto($scope.nPages)
    }
    $scope.next = function(){
        if($scope.page+1 <= $scope.nPages)
            $scope.goto($scope.page+1)
    }
    $scope.prev = function(){
        if($scope.page-1 > 0){
            $scope.goto($scope.page-1)
        }
    }
    $scope.goto = function(page){
        $scope.pages = getPageVector($scope.nPages,page,10)
        $scope.page = page
        var frm = page*$scope.resPerPage - $scope.resPerPage
        var to = page*$scope.resPerPage
        //Server request here
        results.set({"num":$scope.results.num,"rng":[frm,to],"page":page})
    }
};

