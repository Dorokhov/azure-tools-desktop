exports.register = function(module) {
    module
        .controller('hashController', [
            '$scope',
            '$activeDatabase',
            '$redisRepositoryFactory',
            'redisRepo',
            '$redisScannerFactory',
            '$actionBarItems',
            '$dialogViewModel',
            '$confirmViewModel',
            '$notifyViewModel',
            '$redisSettings',
            '$busyIndicator',
            '$messageBus',
            '$validator',
            'uiGridConstants',
            'dialog',
            'actionBarViewModel',
            '$utils',
            'Notification',
            function(
                $scope,
                $activeDatabase,
                $redisRepositoryFactory,
                redisRepo,
                $redisScannerFactory,
                $actionBarItems,
                $dialogViewModel,
                $confirmViewModel,
                $notifyViewModel,
                $redisSettings,
                $busyIndicator,
                $messageBus,
                $validator,
                uiGridConstants,
                dialog,
                actionBarViewModel,
                $utils,
                Notification) {
                var self = this;
                var repo = $redisRepositoryFactory('hash');

                // properties
                $scope.hashApi = null;
                $scope.memberForEdit = null;
                $scope.hashOptions = {
                    enableSorting: true,
                    columnDefs: [{
                        name: 'Name',
                        field: 'Name',
                        width: '*'
                    }, {
                        name: 'Value',
                        field: 'Value',
                        width: '*'
                    }],
                    rowHeight: 18,
                    data: [],
                    enableRowSelection: true,
                    enableSelectAll: false,
                    enableFullRowSelection: true,
                    enableRowHeaderSelection: false,
                    multiSelect: false,
                    enableColumnMenus: false,
                    selectedItems: [],
                    enableColumnResizing: true,
                    enableColumnReordering: true,
                    onRegisterApi: function(gridApi) {
                        $scope.hashApi = gridApi;
                        $scope.hashApi.selection.on.rowSelectionChanged($scope, function(row) {
                            $scope.memberForEdit = {
                                Name: row.entity.Name,
                                Value: row.entity.Value
                            };
                            $scope.hashOptions.selectedItems = [row.entity];
                        });
                        gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows) {
                            $scope.hashOptions.selectedItems.length = 0;
                            for (var i = 0; i < rows.length; i++) {
                                $scope.hashOptions.selectedItems.push(rows[i].entity);
                            };
                        });
                    },
                    getStyle: function() {
                        return {
                            height: '100%'
                        };
                    }
                };

                // commands
                $scope.update = function(key, oldMember, newMember, cb) {
                    cb = cb ? cb : function() {};
                    if (oldMember.Name === newMember.Name) {
                        repo.hset(key, newMember.Name, newMember.Value, cb);
                    } else {
                        repo.replaceMember(key, oldMember.Name, newMember.Name, oldMember.Value, cb);
                    }
                };

                // init
                $scope.$on('reload', function(event) {
                    $scope.memberForEdit = null;
                    $scope.hashOptions.selectedItems.length = 0;
                    $scope.hashOptions.data.length = 0;
                });

                $scope.$on('redisViewModel-key-selected-type-hash', function (event, result) {
                    $scope.memberForEdit = null;
                    $scope.hashOptions.selectedItems.length = 0;

                    var data = result.Value;
                    var hash = [];
                    for (var name in data) {
                        var value = data[name];
                        hash.push({
                            Name: name,
                            Value: value
                        });
                    }

                    $scope.hashOptions.data = hash;
                    actionBarViewModel.addContext($scope);
                });

                $scope.$on('redisViewModel-save-hash', function (event, key) {
                    console.log('-----------SAVEVECSVFDSG')
                    var selectedMember = $scope.hashOptions.selectedItems.length > 0 ? $scope.hashOptions.selectedItems[0] : null;
                    if (selectedMember == null) return;

                    $scope.update(
                        key,
                        selectedMember,
                        $scope.memberForEdit,
                        function() {
                            Notification.success(String.format('Hash with key "{0}" was changed successfully', $utils.truncate(key)));
                            selectedMember.Name = $scope.memberForEdit.Name;
                            selectedMember.Value = $scope.memberForEdit.Value;
                        });
                });
            }
        ]);
};