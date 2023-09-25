let defaultData = {
    menu : [
        {
            'name' : 'Ready to eat',
            'blocked' : false,
            'category' : [
                {
                    'name' : 'Snack',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
                {
                    'name' : 'Nuts',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
            ]
        },
        {
            'name' : 'Instant cook',
            'blocked' : false,
            'category' : [
                {
                    'name' : 'Snack',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
                {
                    'name' : 'Break-fast',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
                {
                    'name' : 'Dal & curries',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                }
            ]
        },
        {
            'name' : 'Heat and eat',
            'blocked' : false,
            'category' : [
                {
                    'name' : 'Soup',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
                {
                    'name' : 'Break-fast',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                },
                {
                    'name' : 'Rice',
                    'status' : 'Active',
                    'blocked' : false,
                    'items' : []
                }
            ]
        }
    ]
  };
  
  function updateDefaultData(newData) {
    // Update the default data with the new data
    defaultData = newData;
  }
  
  module.exports = { defaultData, updateDefaultData };