const REGISTER_LIST = [
    // REGISTER
    {
        name: "CNF1",
        desc: "CONFIGURATION REGISTER 1",
        address: [0x2A],
        width: 8,
        bits: [
            { legend: 'R/W-0', name: "SJW", desc: "Synchronization Jump Width Length bits", consume: 2, join: false, text: [
                "11 = Length = 4 x T<sub>Q</sub>",
                "10 = Length = 3 x T<sub>Q</sub>",
                "01 = Length = 2 x T<sub>Q</sub>",
                "00 = Length = 1 x T<sub>Q</sub>"]
            },

            { legend: 'R/W-0', name: "BRP", desc: "Baud Rate Prescaler bits", consume: 6, join: false, text: [
                "T<sub>Q</sub> = 2 x (BRP[5:0] + 1)/F<sub>OSC</sub>."]
            }
        ]
    },

    // REGISTER
    {
        name: 'CNF2',
        desc: 'CONFIGURATION REGISTER 2',
        address: [0x29],
        width: 8,
        bits: [
            { legend: 'R/W-0', name: 'BTLMODE', desc: "PS2 Bit Time Length bit", text: [
                "1 = Length of PS2 is determined by the PHSEG2[2:0] bits of CNF3",
                "0 = Length of PS2 is the greater of PS1 and IPT (2 T<sub>Q</sub>s)"]
            },

            { legend: 'R/W-0', name: 'SAM', desc: " Sample Point Configuration bit", text: [
                "1 = Bus line is sampled three times at the sample point",
                "0 = Bus line is sampled once at the sample point"]
            },

            { legend: 'R/W-0', name: "PHSEG1", desc: "PS1 Length bits", consume: 3, join: true, text: [
                "(PHSEG1[2:0] + 1) x T<sub>Q</sub>"]
            },

            { legend: 'R/W-0', name: 'PRSEG', desc: "Propagation Segment Length bits", consume: 3, join: false, text: [
                "(PRSEG[2:0] + 1) x T<sub>Q</sub>"]
            }
        ]
    },

    // REGISTER
    {
        name: "CNF3",
        desc: "CONFIGURATION REGISTER 3",
        address: [0x28],
        width: 8,
        bits: [
            { legend: "R/W-0", name: "SOF", desc: "Start-of-Frame signal bit", text: [
                "_If CLKEN (CANCTRL[2]) = 1:",
                "1 = CLKOUT pin is enabled for SOF signal",
                "0 = CLKOUT pin is enabled for clock out function",
                "_If CLKEN (CANCTRL[2]) = 0:",
                "Bit is don't care."]
            },

            { legend: "R/W-0", name: "WAKFIL", desc: " Wake-up Filter bit", text: [
                "1 = Wake-up filter is enabled",
                "0 = Wake-up filter is disabled"]
            },

            { legend: "U-0", name: null, desc: null, consume: 3, join: false, text:[]

            },

            { legend: "R/W-0", name: " PHSEG2", desc: "PS2 Length bits", consume: 3, join: true, text: [
                "(PHSEG2[2:0] + 1) x T<sub>Q</sub>. Minimum valid setting for PS2 is 2 T<sub>Q</sub>s."]
            }
        ]
    }


];




function getLegendCell( text ){
    const gridCell = document.createElement("div");
    gridCell.classList.add("gridCell");
    gridCell.innerHTML = text;
    return gridCell;
}


function getBitCellExtended( name, consume, startColumn, endColumn, inverted = false ){
    const gridCell = getBitCell(name, consume, inverted);
    gridCell.style.gridColumn = `${startColumn} / span ${endColumn}`;
    return gridCell;
}


function getBitCell( name, consume, inverted = false ){
    const gridCell = document.createElement("div");
    gridCell.classList.add("gridCell", "gridCellBitName");
    gridCell.classList.toggle("gridCellShaded", name==null);
    gridCell.innerHTML = (name == null)? '—' : name;
    gridCell.setAttribute("consume", consume);

    gridCell.style.textDecoration = inverted? "overline" : null;

    return gridCell;
}



function getBitContainer(name, consume, desc, text = [], inverted=false){
    const bitContainer = document.createElement("div");
    bitContainer.classList.add("bitContainer");

    bitContainer.innerHTML = `
    <div class="bitNumber">bit ${consume}</div>
    <div class="bitTextList">
        <div class="bitText"> <span>${name}:</span> ${desc}</div>
    </div>`;

    if ( name == null ){
        bitContainer.querySelector(".bitText").innerHTML = ` <span>Unimplemented:</span>  Reads as '0'`;
        return bitContainer;
    }

    for (let i = 0; i < text.length; i++){
        const bitText = document.createElement("div");
        bitText.classList.add("bitText");
        if ( text[i][0] == '_' ){
            bitText.classList.add("bitTextUnderline");
            text[i] = text[i].substr(1);
        }
        bitText.innerHTML = text[i];


        bitContainer.querySelector("span").style.textDecoration = inverted? "overline" : null;

        bitContainer.querySelector(".bitTextList").appendChild(bitText);
    }

    return bitContainer;

}



function getRegister( object = {} ){

    const addressString = object.address.map(e => e.toString(16).toUpperCase().padStart(2,0)+'h').join(', ');
    let currentBitIndex = object.width - 1;

    const register = document.createElement("div");
    register.classList.add("register");

    register.innerHTML = `
    <div class="registerName">${object.name}: ${object.desc} (ADDRESS: ${addressString})</div>

    <div class="registerGrid">
        <div class="gridRow"></div>
        <div class="gridRow"></div>
        <div class="gridRow">
            <div class="gridCell">bit ${object.width-1}</div>
            <div class="gridCell">bit 0</div>
        </div>
    </div>

    <div class="registerBitList"></div>`;


    object.bits.forEach((e, i) => {

        const consumeString = (e.consume)? [currentBitIndex, currentBitIndex - e.consume + 1].join("-") : currentBitIndex;
        const nameString = (e.consume)? e.name + `[${e.consume-1}:0]` : e.name;

        if ( e.consume ){
            if ( e.join && e.name != null ){ 
                register.querySelectorAll(".gridRow")[1].appendChild( getBitCellExtended(nameString, consumeString, object.width-currentBitIndex, e.consume, e.inverted) );
            }

            for (let j = 0; j < e.consume; j++){
                register.querySelector(".gridRow").appendChild( getLegendCell(e.legend) );

                if ( e.join ) continue;
                const tempName = (e.name == null)? null : e.name + (e.consume-j-1);
                register.querySelectorAll(".gridRow")[1].appendChild( getBitCell(tempName, consumeString, e.inverted) );
            }
            currentBitIndex -= e.consume;

        }else{
            register.querySelector(".gridRow").appendChild( getLegendCell(e.legend) );
            register.querySelectorAll(".gridRow")[1].appendChild( getBitCell(e.name, consumeString, e.inverted) );
            currentBitIndex--;
        }

        register.querySelector(".registerBitList").appendChild( getBitContainer((e.name==null)?null:nameString, consumeString, e.desc, e.text, e.inverted) );

    });

    return register;

}




function generateRegisterByList( list = [] ){
    registerList.innerHTML = "";
    list.forEach(reg => registerList.appendChild(getRegister(reg)) );
    legendContainer.style.width = registerList.offsetWidth + 'px';

    document.querySelectorAll(".register").forEach(register => {
    
        register.querySelectorAll(".gridCellBitName").forEach((gridCellBitNameElement, bitIndex) => {
            gridCellBitNameElement.onmouseenter = gridCellBitNameElement.onmouseleave = gridCellBitNameElement.onblur = (event) => {
                const consume = gridCellBitNameElement.getAttribute("consume");
                
                document.querySelectorAll(".bitContainerActive").forEach(e => e.classList.remove("bitContainerActive"));
                document.querySelectorAll(".gridCellBitNameActive").forEach(e => e.classList.remove("gridCellBitNameActive"));
    
                if ( event.type == 'mouseenter' ){
                    register.querySelectorAll(`.gridRow:nth-child(2) .gridCellBitName[consume='${consume}']`)
                        .forEach(e => e.classList.add("gridCellBitNameActive"));
    
                    Array.from(register.querySelectorAll(".bitContainer"))
                        .filter(e => consume == e.querySelector(".bitNumber").innerHTML.substr(4))
                        .forEach(e => e.classList.add("bitContainerActive"));
                }
    
            };
    
        });
    
    
        register.querySelectorAll(".bitContainer").forEach(bitContainer => {
            bitContainer.onmouseenter = bitContainer.onmouseleave = bitContainer.onblur = (event) => {
    
                document.querySelectorAll(".gridCellBitNameActive").forEach(e => e.classList.remove("gridCellBitNameActive"));
    
                if ( event.type == 'mouseenter' ){
                    const consumeFounded = bitContainer.querySelector(".bitNumber").innerHTML.substr(4);
                    register.querySelectorAll(`.gridCellBitName[consume='${consumeFounded}']`)
                        .forEach(e => e.classList.add("gridCellBitNameActive"));
                }
    
            };
    
        });
    
    
        register.onclick = () => {
            main_screen.scrollTo({top: register.offsetTop-95, behavior: "smooth"});
        };
    
    
    });

}





onkeydown = (event) => {
    if ( !event.repeat && event.key.toUpperCase() == 'L' ){
        legendContainer.classList.toggle("legendContainerActive");
    }

    if ( event.key == 'Escape' ){
        registers_screen.style.display = 'flex';
    }

};




function getRegisterItemSearch(name, description, address=[]){

    const registersItem = document.createElement("label");
    registersItem.classList.add("registersItem");
    registersItem.innerHTML = `
        <div class="checkbox">
            <input type="checkbox" class="registerCheckbox">
        </div>
        <div class="registerItemContent">
            <div class="registerName">${name}</div>
            <div class="registerDesc">${description}</div>
        </div>
        <div class="registerAddress">${address.join(", ")}</div>
    `;

    return registersItem;

}

function populateRegisterSearchList(){
    registersList.innerHTML = '';
    REGISTER_LIST.forEach(reg => registersList.appendChild( getRegisterItemSearch(reg.name, reg.desc, reg.address.map(e => '0x'+e.toString(16).toUpperCase().padStart(2,0))) ));
}


searchInput.oninput = (event) => {
    const searchString = event.target.value.trim().toLowerCase();

    registersList.innerHTML = '';

    if ( searchString.length == 0 ){ 
        populateRegisterSearchList();
        return;
    }

    REGISTER_LIST
        .filter(e => 
            e.name.toLowerCase().includes(searchString) || e.desc.toLowerCase().includes(searchString) )
        .forEach(reg => {
            const addressString = reg.address.map(e => '0x'+e.toString(16).toUpperCase().padStart(2,0));
            const tempRegisterItem = getRegisterItemSearch(reg.name, reg.desc, addressString);
            registersList.appendChild( tempRegisterItem );
        });

}


searchButton.onclick = () => {
    const selectedRegisters = Array.from(registersList.querySelectorAll(".registerCheckbox:checked"))
        .map(e => e.parentElement.nextElementSibling.querySelector(".registerName").innerHTML);

    if ( selectedRegisters.length == 0 ) return;

    generateRegisterByList( REGISTER_LIST.filter(e => selectedRegisters.includes(e.name)) );
    main_screen.scrollTo({top: 0, behavior: "smooth"});

    registers_screen.style.display = 'none';
    
}


onload = () => {
    populateRegisterSearchList();
}