//This document will contain necessary function for the game.  by tedhyu.  
const lattice_shift = 3**(1/2) //multiplicative shift
const x_shift=-0.5 //x shift (needs to calibrate according to the board exactly with mouse)
const y_shift=(3**0.5)/2 //y shift (needs to calibrate according to the board exactly with mouse)

 //transformation matrix
transform = [[3**(1/2)/2,-1/2],[0,1]] 
inverse_transform = [[2/3**(1/2),1/3**(1/2)],[0,1]]



/*hex_to_xy

input:  the a and b lattice vector corresponding to the hexagon. (a,b) is designated for each hexagon.

output:  the x and y coordinates of hexagon (a,b).  Note, the lattice_shift, x_shift, and y_shift correspionds to a specific grid that is shown in the image.  This probably needs to be shifted for the actual program and adjust accordingly.
*/
function hex_to_xy(a,b){
        lattice_x = (lattice_shift)*(transform[0][0]*b+transform[1][0]*a)+x_shift
        lattice_y = (lattice_shift)*(transform[0][1]*b+transform[1][1]*a)+y_shift  
        return [lattice_x,lattice_y]
}





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
        orig_x = x
        orig_y = y
        x = x - x_shift
        y = y - y_shift
 
        //create a list of possible hexagon the x and y can reside in.
        lattice_y = (1/lattice_shift)*(inverse_transform[0][0]*x+inverse_transform[1][0]*y)
        lattice_x = (1/lattice_shift)*(inverse_transform[0][1]*x+inverse_transform[1][1]*y)   
     
        //To find the lattice point closest, we have to consider four points and use distance formula to consider which is closest.  Because there's decimals, we will consider four based on the fraction value.  So for (8.5, 7.5), we will consider (8,7), (8,8), (9,7), and (9,8).  There is probably more elegant mathematical way, but I haven't found any.
        int_y = Math.floor(lattice_y)
        int_x = Math.floor(lattice_x)
        possible_lattice=[[int_x,int_y],[int_x,int_y+1],[int_x+1,int_y],[int_x+1,int_y+1]]

        board_xy=[]  //xy coordinate of possible lattice
        for (i=0;i<possible_lattice.length;i++){
                possible_lat_xy = hex_to_xy(possible_lattice[i][0],possible_lattice[i][1])
                board_xy.push(possible_lat_xy)
        }

        //find the distance between the mouse click and the lattice point closest to it.  Keep the minimum index, so the correct lattice point is found for the hexagon the point lies in.
        minimum = 1000000
        min_index=0
        for(i=0;i<board_xy.length;i++){
                if(((board_xy[i][0]-orig_x)**2+(board_xy[i][1]-orig_y)**2)**(1/2)<minimum){
                        minimum = ((board_xy[i][0]-orig_x)**2+(board_xy[i][1]-orig_y)**2)**(1/2)
                        min_index=i
                }
        }


        //Lastly:  determine which part of the hexagon the point is in choices: (1-6).  

        dX = orig_x-board_xy[min_index][0]
        dY = -(orig_y-board_xy[min_index][1])  //y axis is flipped from traditional y axis
        arctan = Math.atan(dY/dX)

        if(dX >= 0){
                if(arctan<=Math.PI/2 & arctan>=Math.PI/6){
                        c = 2
                }
                else if(arctan<=Math.PI/6 & arctan>=-Math.PI/6){
                        c = 3
                }
                else if(arctan<=-Math.PI/6 & arctan>=-Math.PI/2){
                        c = 4
                }
        }
        else{
                if(arctan<=Math.PI/2 & arctan>=Math.PI/6){
                        c = 5
                }
                else if(arctan<=Math.PI/6 & arctan>=-Math.PI/6){
                        c = 6
                }
                else if(arctan<=-Math.PI/6 & arctan>=-Math.PI/2){
                        c = 1
                }
        }
        return [possible_lattice[min_index][0],possible_lattice[min_index][1],c]

}

//Example run:
//conversion of geometry index to x y coordinate.
//xy coordinate of center of hexagon (1,1).  It should be at x = 1, y = sqrt(3)
console.log(hex_to_xy(1,1))




//Example run2:
//Find the hexagon number and the section of the hexagon of coordinate, 7.9, 4*sqrt(3)
//as see in the image, it should be in section 3 of hexagon (6,5)
console.log(xy_to_hex(7.9,(3**0.5)*4))
