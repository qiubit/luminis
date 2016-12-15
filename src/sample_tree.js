var tree = [{
    id: '1',
    primaryText: 'node 1',
    children: [
      {
        id: '2',
        primaryText: 'node 2',
        children: [
          {
            id: '4',
            primaryText: 'node 4',
            children: [
              {
                id: '5',
                primaryText: 'node 5',
                children: [
                  {
                    id: '6',
                    primaryText: 'node 6',
                    children: [],
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        id: '3',
        primaryText: 'node 3',
        children: []
      }
    ]
}]

export default tree;

