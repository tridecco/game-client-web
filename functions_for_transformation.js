//This document will contain necessary function for the game.  by tedhyu.  


/*xy_to_hex
input:  the x and y location of the mouse pad.

output:  three integers array in the format of the hexagon location
        [a,b,c]
        a:  the first index of the hexagon 
        b:  the second index of the hexagon 
        c:  1-6 describing the section of the hexagon.  

With the value of a,b,c returned, the app can recognize which space the mouse click corresponds to, which maps the a,b,c value for every space on the board.
For example, the (1,1) hexagon in the upper left corner.  If the mouse clicks on its the lower right corner of this hexagon, the returned value is (1,1,3), which indicates that 
the right piece of the hexagon was clicked.  Additional code willbe used to recognize that (1,1,3) corresponds to space #1 on the board.
*/

function xy_to_hex(x,y){
        const lattice = 5
        transform = [[3**(1/2)/2,-1/2],[0,1]]  //transformation matrix

        //board hexagon list
        board=[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],[1,9],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],[3,10],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8],[4,9],[4,10],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10],[6,11],[6,12],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[9,5],[9,6],[9,7],[9,8],[9,9],[9,10],[9,11],[9,12],[9,13],[10,6],[10,7],[10,8],[10,9],[10,10],[10,11],[10,12],[10,13],[10,14],[11,6],[11,7],[11,8],[11,9],[11,10],[11,11],[11,12],[11,13],[11,14]]
        board_xy=[]
        //this changes the lattice number to xy coordinates
        for (i=0;i<board.length;i++){
                board_xy_x = transform[0][0]*board[i][0]+transform[1][0]*board[i][1]
                board_xy_y = transform[0][1]*board[i][0]+transform[1][1]*board[i][1]          
                board_xy.push([board_xy_x,board_xy_y])
        }
        console.log(board_xy)
        return [1,2,3]
}
