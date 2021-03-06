//previous candle traded price - current traded price.
'use strict';
var app = angular.module('mainApp', []);

var stockService = app.service('stockService', function ($http) {

    this.updateData = function (callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/refreshData"
        }).then(function mySuccess(response) {
            callbackFunc(response.data);
        }, function myError(response) {
        });
    }

    this.shutdown = function () {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/terminate"
        }).then(function mySuccess(response) {
            alert("Server Shutdown complete");
        }, function myError(response) {
        });
    }

    this.setSchedulerTime = function (newTime) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/updateTime?time=" + newTime
        }).then(function mySuccess(response) {
            alert("updated scheduler timer");
        }, function myError(response) {
        });
    };

    this.getAllData = function (type, callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getAllData?key=" + type
        }).then(function mySuccess(response) {
            console.log(response.data);
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

    this.getDataJson = function (callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getDataJson"
        }).then(function mySuccess(response) {
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

    this.getCurrentDataJson = function (callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getCurrentDataJson"
        }).then(function mySuccess(response) {
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

    this.getOldJson = function (type, callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getOldJson?key=" + type
        }).then(function mySuccess(response) {
            console.log(response.data);
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

    this.getReferenceData = function (type, callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getReferenceData?key=" + type
        }).then(function mySuccess(response) {
            console.log(response.data);
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

    this.referenceStatus = function (callbackFunc) {
        $http({
            method: "GET",
            url: "http://127.0.0.1:5002/getCandleStatus"
        }).then(function mySuccess(response) {
            console.log(response.data);
            callbackFunc(response.data);
        }, function myError(response) {
        });
    };

});

app.controller('stockController', function ($scope, stockService, $http) {
    var gridDiv = document.querySelector('#myGrid');
    $scope.selectedTab = "Nifty 50";
    $scope.rowData = [];
    $scope.rowDataOld = [];
    $scope.referenceTime = "09:40:00 AM";
    $scope.selectedType = 'Nifty 50';
    $scope.merged = [];
    $scope.previousData = [];
    $scope.candleCount = -1;
    $scope.allIndices = ['Nifty Next 50', 'Nifty 50', 'Nifty Midcap 50', 'Nifty Bank', 'Nifty Energy', 'Nifty FIN Service', 'Nifty FMCG', 'Nifty IT', 'Nifty Media', 'Nifty Metal', 'Nifty Pharma', 'Nifty PSU Bank', 'Nifty Realty', 'Nifty PVT Bank'];
    var columnDefs = [
        { headerName: "Symbol", field: "symbol" },
        { headerName: "Last Traded Price", field: "ltP" },
        { headerName: "Open", field: "open" },
        { headerName: "Low", field: "low" },
        { headerName: "High", field: "high" },
        { headerName: "Trade Volume", field: "trdVol" },
        // { headerName: "6th Candle Price", field: "reference" },
        { headerName: "Reference Status", field: "status", sort: 'desc' }
    ];

    function createNewEntry(symbol, open, low, high, trdVol, lastTraded) {
        var item = {
            symbol: symbol,
            open: open,
            low: low,
            high: high,
            trdVol: trdVol,
            ltP: lastTraded
        };
        return item;
    }

    $scope.gridOptions = {
        animateRows: true,
        columnDefs: columnDefs,
        rowData: $scope.rowData,
        enableFilter: true,
        floatingFilter: true,
        getRowStyle: getRowStyleScheduled,
        enableSorting: true,
        onGridReady: function () {
            sizeToFit();
        }
    };

    function sizeToFit() {
        $scope.gridOptions.api.sizeColumnsToFit();
    };

    $scope.update = function () {
        $scope.gridOptions.api.showLoadingOverlay();
        stockService.updateData(function (data) {
            console.log(data);
            if (data) {
                $scope.fetchData(true);
            }
        });
    };

    $scope.terminate = function () {
        stockService.shutdown();
        alert("Server Shutdown complete");
    };

    $scope.init = function () {
        new agGrid.Grid(gridDiv, $scope.gridOptions);
        $scope.fetchData(true);
    };

    $scope.setSchedulerTime = function () {
        if ($scope.schedulerTime !== "undefined") {
            var data = $scope.schedulerTime.split(":");
            if (Number(data[0]) >= Number(0) && Number(data[0]) < Number(24) && Number(data[1]) >= Number(0) && Number(data[1]) < Number(60)) {
                stockService.setSchedulerTime($scope.schedulerTime);
            }
            else {
                alert("enter the time in proper format (hh:mm) ex. (09:25) or (15:30)");
            }
        } else {
            alert("please enter the time");
        }
    };

    $scope.fetchData = function (callbackFunc) {
        console.log($scope.selectedType);
        $scope.gridOptions.api.setRowData([]);
        stockService.getAllData($scope.selectedType, function (data) {
            console.log(data);
            $scope.candleCount = $scope.candleCount + 1;
            $scope.updatePreviousData(callbackFunc);
            for (var i = 0; i < data.data.length; i++) {
                var newItem = createNewEntry(data.data[i].symbol, data.data[i].open, data.data[i].low, data.data[i].high, data.data[i].trdVol, data.data[i].ltP);
                var res = $scope.gridOptions.api.updateRowData({ add: [newItem] });
            }
            sizeToFit();
        });
    }

    $scope.updatePreviousData = function (callbackFunc) {
        var symbols = [];
        if (!callbackFunc) {
            setTimeout(function () {
                $scope.setStatus();
            }, 10);
        } else {
            stockService.getCurrentDataJson(function (currData) {
                var currentData = [].concat.apply([], currData);
                stockService.getDataJson(function (data) {
                    $scope.merged = [].concat.apply([], data);
                    if ($scope.candleCount === 0) {
                        $scope.merged.map(function (item) {
                            $scope.previousData.push({
                                symbol: item.symbol,
                                status: []
                            });
                        });
                    } else {
                        $scope.merged.forEach(function (item) {
                            if (!symbols.includes(item.symbol)) {
                                symbols.push(item.symbol);
                                var current = getOldDataLtp(item.symbol, currentData).replace(/,/g, '');
                                var oldData = getOldDataLtp(item.symbol, $scope.merged).replace(/,/g, '');
                                if (current > oldData) {
                                    $scope.previousData.forEach(function (key) {
                                        if (key.symbol === item.symbol) {
                                            key.status.push('ABOVE');
                                        }
                                    });
                                } else if (current < oldData) {
                                    $scope.previousData.forEach(function (key) {
                                        if (key.symbol === item.symbol) {
                                            key.status.push('BELOW');
                                        }
                                    });
                                } else {
                                    $scope.previousData.forEach(function (key) {
                                        if (key.symbol === item.symbol) {
                                            key.status.push('EQUAL');
                                        }
                                    });
                                }
                            }
                        });
                    }
                    console.log($scope.previousData);
                    setTimeout(function () {
                        $scope.setStatus();
                    }, 10);
                });
            });
        }
    }

    $scope.setStatus = function () {
        var greenList = [];
        var redList = [];
        $scope.previousData.forEach(function (item) {
            if (item.status.length >= 3) {
                var len = item.status.length - 1;
                if (item.status[len] === item.status[len - 1] && item.status[len - 1] === item.status[len - 2] && item.status[len] === 'ABOVE') {
                    greenList.push(item.symbol);
                } else if (item.status[len] === item.status[len - 1] && item.status[len - 1] === item.status[len - 2] && item.status[len] === 'BELOW') {
                    redList.push(item.symbol);
                }
            }
        });
        setTimeout(() => {
            $scope.gridOptions.api.forEachNode(function (item) {
                if (greenList.includes(item.data.symbol)) {
                    item.setDataValue('status', 'ABOVE');
                } else if (redList.includes(item.data.symbol)) {
                    item.setDataValue('status', 'BELOW');
                }
            });
            setTimeout(function () {
                $scope.gridOptions.api.refreshClientSideRowModel('sort');
            }, 10);
        }, 10);
    }

    $scope.updatecandleData = function () {
        console.log('update Data if flag is true');
        stockService.referenceStatus(function (data) {
            if (data) {
                stockService.getReferenceData($scope.selectedType, function (data) {
                    // var mergedReferenceData = [].concat.apply([], data);
                    $scope.gridOptions.api.forEachNode(function (node, index) {
                        var val1 = node.data.ltP.replace(/,/g, '');
                        var val2 = getOldDataLtp(node.data.symbol, data.data).replace(/,/g, '');
                        console.log(val1, val2)
                        node.setDataValue('reference', val2);
                        if (val1 > val2) {
                            node.setDataValue('status', 'ABOVE');
                        } else if (val2 > val1) {
                            node.setDataValue('status', 'BELOW');
                        }
                    });
                    setTimeout(function () {
                        $scope.gridOptions.api.refreshClientSideRowModel('sort');
                    }, 10);
                });
            }
        });
    }

    $scope.updatePercentageData = function () {
        stockService.getOldJson($scope.selectedType, function (data) {
            console.log("Old Data");
            var oldData = data.data;
            oldData.forEach((node) => {
                console.log(node);
            });
            $scope.gridOptions.api.forEachNode(function (node, index) {
                var val1 = node.data.ltP.replace(/,/g, '');
                var val2 = getOldDataLtp(node.data.symbol, oldData).replace(/,/g, '');
                var perc = ((val1 - val2) / val1) * 100;
                console.log("new Value : ", val1, ' Old Value : ', val2, ' Perc Change : ', perc);
                node.setDataValue('percChange', perc);
                if (Math.abs(perc) >= $scope.tradeVolume) {
                    if (perc > 0) {
                        node.setDataValue('percIndicator', 'Above');
                    }
                }
            });
        });
    }

    function getOldDataLtp(data, oldData) {
        for (var i = 0; i < oldData.length; i++) {
            if (oldData[i].symbol === data) {
                return oldData[i].ltP;
            }
        }
    }

    function getRowStyleScheduled(params) {
        if (params.data.status === 'ABOVE') {
            return {
                'background-color': 'GREEN',
                'color': 'WHITE'
            }
        } else if (params.data.status === 'BELOW') {
            return {
                'background-color': 'RED',
                'color': 'WHITE'
            };
        }
        return null;
    };

    $scope.init();

    setInterval(function () {
        console.log("Updating Data...");
        $scope.update();
    }, 300000);

});