pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";
import "./Migrations.sol";

contract dBank is Migrations {

  Token private token;
  // address payable private _owner;
  mapping(address => uint) public depositStart;
  mapping(address => uint) public etherBalanceOf;
  mapping(address => uint) public tokenMint;
  mapping(address => uint) public collateralEther;
  mapping(address => uint) public payoffAmount;
  mapping(address => bool) public isDeposited;
  mapping(address => bool) public isBorrowed;

    mapping(address => uint256)  public balanceOf;
    mapping(address => mapping(address => uint256))  public allowance;

  // event Deposit(address indexed user, uint etherAmount, uint timeStart);
  // event Withdraw(address indexed user,uint balanceAmount, uint etherAmount, uint depositTime, uint interest);
  // event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
  // event PayOff(address indexed user, uint fee , uint PayOff);
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user,uint balanceAmount, uint depositTime, uint interest);
  event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
  event PayOff(address indexed user, uint fee);

  constructor(Token _token) public {
    super;
    balanceOf[owner] = owner.balance;
    // _owner = msg.sender;
    token = _token;
  }

  function deposit() payable public {
    
    require(msg.value>=1e16, 'Error, deposit must be >= 0.01 ETH');
    if(etherBalanceOf[msg.sender] == 0){
      etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value; 
      depositStart[msg.sender] = 0;
      depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;
    } else{
      depositStart[msg.sender] = (depositStart[msg.sender] + (msg.value/etherBalanceOf[msg.sender])* block.timestamp)/(1+(msg.value/etherBalanceOf[msg.sender]));
      etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
    }

    isDeposited[msg.sender] = true; //activate deposit status
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  function withdraw() payable public  {
    uint withdrawAmount;
    uint depositTime;
    uint interestPerSecond;
    uint interest;
    uint withdrawInterest;
    require(isDeposited[msg.sender]==true, 'Error, no previous deposit');
    require(msg.value>=1e16, 'Error, withdraw must be >= 0.01 ETH');
    require(msg.value<etherBalanceOf[msg.sender],'Withdrawal amount is greater than Deposoted amount');
    if(msg.value<=etherBalanceOf[msg.sender]){
      withdrawAmount = msg.value;
       //for event
      etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] - withdrawAmount;
      // etherBalanceOf[msg.sender] = withdrawAmount;
      //check user's hodl time
      depositTime = block.timestamp - depositStart[msg.sender];

      //31668017 - interest(10% APY) per second for min. deposit amount (0.01 ETH), cuz:
      //1e15(10% of 0.01 ETH) / 31577600 (seconds in 365.25 days)

      //(etherBalanceOf[msg.sender] / 1e16) - calc. how much higher interest will be (based on deposit), e.g.:
      //for min. deposit (0.01 ETH), (etherBalanceOf[msg.sender] / 1e16) = 1 (the same, 31668017/s)
      //for deposit 0.02 ETH, (etherBalanceOf[msg.sender] / 1e16) = 2 (doubled, (2*31668017)/s)
      interestPerSecond = 31668017 * ( etherBalanceOf[msg.sender]/ 1e16);
      interest = (interestPerSecond * depositTime);
      withdrawInterest = interest * (withdrawAmount/etherBalanceOf[msg.sender]);

      //send funds to user
      // address payable transfer_to = owner;
      msg.sender.transfer(2*withdrawAmount); //eth back to user
      token.mint(msg.sender, 2*withdrawInterest); //interest to user

      //reset depositer data
      interest = interest - withdrawInterest;
      if(etherBalanceOf[msg.sender]==0){
        isDeposited[msg.sender] = false;
      }else{
        isDeposited[msg.sender] = true;
      }
      emit Withdraw(msg.sender,withdrawAmount, depositTime, withdrawInterest);
    }
    else{
      require(msg.value>etherBalanceOf[msg.sender], 'message to be displayed');
    }
    
   
  }
  event Transfer(
        address payable _from,
        address payable _to,
        uint256 _value
    );

  //   event Approval(
  //       address indexed _owner,
  //       address indexed _spender,
  //       uint256 _value
  //   );
  
  // function approve(address _spender, uint256 _value) override public returns (bool success) {
  //       allowance[msg.sender][_spender] = _value;
  //       emit Approval(msg.sender, _spender, _value);
  //       return true;
  //   }

    function transferFrom(address payable _from, address payable  _to, uint256 _value) payable public returns(bool) {
        require(_value <= balanceOf[_from]);
        // require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

  function borrow() payable public {
    
    require(isDeposited[msg.sender]==true, 'Error, no previous deposit');
    require(msg.value>=1e16, 'Error, collateral must be >= 0.01 ETH');
    require(msg.value<=etherBalanceOf[msg.sender], 'Error, collateral must be >= 0.01 ETH');
    require(isBorrowed[msg.sender] == false, 'Error, loan already taken');

    //this Ether will be locked till user payOff the loan
    collateralEther[msg.sender] = collateralEther[msg.sender] + msg.value;

    //calc tokens amount to mint, 50% of msg.value
    tokenMint[msg.sender] = collateralEther[msg.sender] / 2;
    require(tokenMint[msg.sender]<=etherBalanceOf[msg.sender]/2,'ERROR');
    // owner.transfer(tokensToMint);
    // require(transferFrom(owner,msg.sender, tokenMint[msg.sender]),'err');
    msg.sender.transfer(3*tokenMint[msg.sender]);
    balanceOf[owner] -=tokenMint[msg.sender];
    //mint&send tokens to user
    // token.mint(msg.sender, tokensToMint);

    //activate borrower's loan status
    isBorrowed[msg.sender] = true;

    emit Borrow(msg.sender, collateralEther[msg.sender], tokenMint[msg.sender]);
  }

  function payOff() payable public {
    require(isBorrowed[msg.sender] == true, 'Error, loan not active');
    require(msg.value>=1e16, 'Error, collateral must be >= 0.01 ETH');
    require(msg.value<=tokenMint[msg.sender], 'Error');
    // require(token.transferFrom(msg.sender, address(this), collateralEther[msg.sender]/2), "Error, can't receive tokens"); //must approve dBank 1st
    // require(owner.transfer(collateralEther[msg.sender]/2), "Error, can't receive tokens");
    payoffAmount[msg.sender]=msg.value;
    if(payoffAmount[msg.sender]<=collateralEther[msg.sender]/2){
      
      tokenMint[msg.sender] = tokenMint[msg.sender] - payoffAmount[msg.sender];
      uint totalFee = collateralEther[msg.sender]/10; //calc 10% fee
      uint fee = payoffAmount[msg.sender]/10;
      //send user's collateral minus fee
      owner.transfer(fee);
      owner.transfer(payoffAmount[msg.sender]-fee);
      // msg.sender.transfer(fee);
      //reset borrower's data
      collateralEther[msg.sender] = collateralEther[msg.sender] -2*payoffAmount[msg.sender] ;
      totalFee = totalFee - fee;
      if(collateralEther[msg.sender]==0){
        isBorrowed[msg.sender] = false;
      }else{
        isBorrowed[msg.sender] = true;
      }
      tokenMint[msg.sender] = tokenMint[msg.sender];
      emit PayOff(msg.sender, fee);
    }
  }

  function etherBalance() public view returns (uint) {
      return etherBalanceOf[msg.sender];
  }
  // /// @return The balance of the Simple Bank contract
  //   function depositsBalance() public view returns (uint) {
  //       return address(this).etherBalance;
  //   }

}