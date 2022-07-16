const NODE_SEP = 1200;
const start_y_pos = -1775;
const LEVEL_DEPTH = 1000;

function first_pass(curr_node, first_x_obj, modifier_obj, pc_edges, parent_to_children_obj){

    const curr_children = parent_to_children_obj[curr_node];
    if (curr_children != undefined){
        for (let i = 0; i < curr_children.length; i++){
            first_pass(curr_children[i], first_x_obj, modifier_obj, pc_edges, parent_to_children_obj);
        }
    }
    let has_left_siblings = false;

    //now check to see if the current node has a previous sibling
    const curr_node_parent = pc_edges[curr_node];

    if (curr_node_parent != undefined && curr_node_parent != 'root'){

        const curr_node_siblings = parent_to_children_obj[curr_node_parent];

    
        var idx_of_curr_node = curr_node_siblings.indexOf(curr_node)
        if ( idx_of_curr_node != 0){
            first_x_obj[curr_node] = first_x_obj[(curr_node_siblings[idx_of_curr_node - 1])] + NODE_SEP;
            has_left_siblings = true;
        }else{
            first_x_obj[curr_node] = 0;
        }

    }else{
        //curr_node is the root
        first_x_obj[curr_node] = 0;
    }


    if (curr_children != undefined){
       if (curr_children.length == 1){
          modifier_obj[curr_node] = first_x_obj[curr_node];
       }else{
          desired_x = (first_x_obj[curr_children[curr_children.length -1]] - first_x_obj[curr_children[0]])/2;
          modifier_obj[curr_node] = first_x_obj[curr_node] - desired_x;
          
       }
    }


}   

function secondPass (curr_node, modSum, final_x_obj, first_x_obj, modifier_obj, pc_edges, parent_to_children_obj){

    final_x_obj[curr_node] = first_x_obj[curr_node] + modSum + (NODE_SEP); //1.5 is the farthest child to the left of the graph
    const curr_children = parent_to_children_obj[curr_node];

    if (curr_children != undefined){
        for (let i = 0; i < curr_children.length; i++){
            curr_node_modifier = modifier_obj[curr_node];
            secondPass(curr_children[i],curr_node_modifier + modSum, final_x_obj, first_x_obj, modifier_obj, pc_edges, parent_to_children_obj);
        }
    }
}


//simple function that assigns levels to nodes and returns the corresponding object
function assignNodeLevels(curr_node, node_to_level, curr_level, pc_edges, parent_to_children_obj) {

    const curr_children = parent_to_children_obj[curr_node];

    //assign the node level to the current node
    node_to_level[curr_node] = curr_level;
    if (curr_children != undefined) {
        for (let i = 0; i < curr_children.length; i++) {
            let curr_child = curr_children[i];
            let new_level = curr_level + 1;
            assignNodeLevels(curr_child, node_to_level, new_level, pc_edges, parent_to_children_obj);
        }
    }

}


function shiftChildren(curr_node, shiftValue, final_x_obj, pc_edges, parent_to_children_obj) {


    const curr_children = parent_to_children_obj[curr_node];
    if (curr_children != undefined){
        //first adjust all children positions
        for (let i = 0; i < curr_children.length; i++) {
            let curr_child = curr_children[i];
            final_x_obj[curr_child] += shiftValue;


            shiftChildren(curr_child, shiftValue, final_x_obj, pc_edges, parent_to_children_obj);

        }

    }

}


function fixParentPositions(curr_node, final_x_positions, pc_edges, parent_to_children_obj) {
    
    let curr_parent = pc_edges[curr_node];
    let first_child_pos;
    let last_child_pos;
    let new_parent_pos;

    //first check if the node is an only child, then adjust it so
    //it's directly under the parent

    if (curr_parent != undefined && curr_parent != 'root') {
        let curr_siblings = parent_to_children_obj[curr_parent];
        if (curr_siblings.length == 1) {
            if (final_x_positions[curr_parent] != final_x_positions[curr_node]) {
                final_x_positions[curr_node] = final_x_positions[curr_parent];
            }
        }
    }

    let curr_children = parent_to_children_obj[curr_node];
    if (curr_children != undefined) {
        for (let i = 0; i < curr_children.length; i++) {
            fixParentPositions(curr_children[i], final_x_positions, pc_edges, parent_to_children_obj)
        }
        first_child_pos = final_x_positions[curr_children[0]];
        last_child_pos = final_x_positions[curr_children[curr_children.length - 1]];
        new_parent_pos = (first_child_pos + last_child_pos)/2;
        final_x_positions[curr_node] = new_parent_pos;
        
    }

        
}


//finds the largest overlap of the children of the curr node
function findLargestOverlap(curr_node, final_x_obj, max_x_positions_at_each_level, largest_overlap_val, curr_level, pc_edges, parent_to_children_obj) {
    
    let curr_children = parent_to_children_obj[curr_node];
    
    if (curr_children != undefined) {

        for (let i = 0; i < curr_children.length; i++) {
            
            let new_overlap_val = findLargestOverlap(curr_children[i], final_x_obj, max_x_positions_at_each_level, largest_overlap_val, curr_level + 1, pc_edges, parent_to_children_obj);
            if (new_overlap_val > largest_overlap_val || largest_overlap_val == undefined) {
                largest_overlap_val = new_overlap_val
            }
        }
        
    }

    
    let curr_max_x_at_node_level_data = max_x_positions_at_each_level[curr_level];


    if (curr_max_x_at_node_level_data != undefined) {

        let curr_max_x_at_node_level_x = curr_max_x_at_node_level_data.x_val;
        let curr_max_x_at_node_level_node = curr_max_x_at_node_level_data.node;

        let x_of_curr_node = final_x_obj[curr_node];


        if ((curr_max_x_at_node_level_x - x_of_curr_node) < NODE_SEP) {

            largest_overlap = 0;

        }

        if (x_of_curr_node <= curr_max_x_at_node_level_x) {
            let new_largest_overlap_val = (curr_max_x_at_node_level_x - x_of_curr_node);

            if (new_largest_overlap_val > largest_overlap_val) {
                largest_overlap_val = new_largest_overlap_val;
            }

        }
    }

    return largest_overlap_val

    
}


function fixNodeConflicts(curr_node, final_x_obj, node_to_level, max_x_positions_at_each_level, pc_edges, parent_to_children_obj) {
    

            //first adjust the position of the current node if need be
            let largest_overlap = findLargestOverlap(curr_node, final_x_obj, max_x_positions_at_each_level, -Infinity, node_to_level[curr_node], pc_edges, parent_to_children_obj);
            if (largest_overlap >= 0) {

                let shift_amount = largest_overlap + NODE_SEP;
                    final_x_obj[curr_node] += shift_amount;


                    //if we shift a parent but it's child isn't overlapping any nodes, it also needs to get shifted
                    //but it won't get accounted for in the next iteration

                    let curr_children = parent_to_children_obj[curr_node];

                    shiftChildren(curr_node, shift_amount, final_x_obj, pc_edges, parent_to_children_obj);

                    /*if (curr_children != undefined) {
                         let first_child = curr_children[0];

                         console.log('first child', first_child)

                         let child_overlap = findLargestOverlap(curr_node, final_x_obj, max_x_positions_at_each_level, -Infinity, node_to_level[first_child], pc_edges, parent_to_children_obj);

                         console.log('child overlap', child_overlap)
                         if (child_overlap < 0) {
                             
                             shiftChildren(curr_node, shift_amount, final_x_obj, pc_edges, parent_to_children_obj);

                         }
                     }*/

                   

                    
            }

            //then we want to adjust the max x position
            let current_level = node_to_level[curr_node];

            max_x_positions_at_each_level[current_level] = {x_val: final_x_obj[curr_node], node: curr_node};


            const curr_children = parent_to_children_obj[curr_node];
            if (curr_children != undefined) {
                for (let i = 0; i < curr_children.length; i++) {
                    let curr_child = curr_children[i];

                    fixNodeConflicts(curr_child, final_x_obj, node_to_level, max_x_positions_at_each_level, pc_edges, parent_to_children_obj);
                }
            }

    
    


}


function assign_node_positions(root, cy_nodes, pc_edges, parent_to_children_obj) {
    let intitial_x_positions = {};
    let modifier_obj = {};
    let node_to_level = {};
    let max_x_positions_at_each_level = {};

    first_pass(root, intitial_x_positions, modifier_obj, pc_edges, parent_to_children_obj);
    let final_x_positions = {};
    secondPass(root, 0, final_x_positions, intitial_x_positions, modifier_obj, pc_edges, parent_to_children_obj);
    assignNodeLevels(root, node_to_level, 0, pc_edges, parent_to_children_obj);

    let new_final_x_positions = {...final_x_positions}
    fixNodeConflicts(root, new_final_x_positions, node_to_level, max_x_positions_at_each_level, pc_edges, parent_to_children_obj);
    fixParentPositions(root, new_final_x_positions, pc_edges, parent_to_children_obj);

    for (let i = 0; i < cy_nodes.length; i++) {
        let curr_node_id = cy_nodes[i][0]._private.data.id;
        let new_y = start_y_pos + (node_to_level[curr_node_id])*LEVEL_DEPTH;

        cy_nodes[i][0]._private.position = {x: new_final_x_positions[curr_node_id], y: new_y}
    }

}
            
