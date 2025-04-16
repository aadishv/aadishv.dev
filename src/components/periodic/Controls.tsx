import React, { useRef } from "react";

interface SearchBarProps {
  inputRef: React.RefObject<HTMLInputElement>;
  onSearch: (e: React.FormEvent) => void;
}

export const SearchBar = ({ inputRef, onSearch }: SearchBarProps) => {
  return (
    <form onSubmit={onSearch} className="flex">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search... (Cmd+F)"
        className="border-b-2 border-header2 font-mono text-xl focus:border-header focus:outline-none"
        style={{ width: "56vw", marginRight: "2vw" }}
      />
      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
};

interface RandomButtonProps {
  onClickRandom: () => void;
}

export const RandomButton = ({ onClickRandom }: RandomButtonProps) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickRandom}
      >
        Random
      </button>
    </div>
  );
};

interface ReferenceButtonProps {
  onClickReference: () => void;
}

export const ReferenceButton = ({ onClickReference }: ReferenceButtonProps) => {
  return (
    <div className="mr-4 flex items-end">
      <button
        className="m-0 h-8 justify-center truncate border-b-2 border-header2 p-0 font-lora text-xl hover:border-header"
        onClick={onClickReference}
      >
        References
      </button>
    </div>
  );
};

interface ModalButtonProps {
  onClickModal: () => void;
  isDisabled?: boolean;
}

export const ModalButton = ({ onClickModal, isDisabled = false }: ModalButtonProps) => {
  const handleClick = () => {
    if (isDisabled) {
      alert("The formula mass calculator has been temporarily disabled on April 16-17, 2025 for the Stanford OHS OC005 quiz. Please try again after this date.");
      return;
    }
    onClickModal();
  };

  return (
    <div className="flex items-end">
      <button
        className={`m-0 h-8 justify-center truncate border-b-2 p-0 font-lora text-xl ${
          isDisabled 
            ? "border-gray-300 text-gray-400 cursor-not-allowed" 
            : "border-header2 hover:border-header"
        }`}
        onClick={handleClick}
        // Don't use the disabled attribute so we can still show the alert
      >
        Formula mass calculator
      </button>
    </div>
  );
};

export const Controls = ({
  searchInputRef,
  handleSearch,
  handleRandomClick,
  handleReferenceModalOpen,
  handleMassModalToggle,
  isDisabled = false
}) => {
  return (
    <div className="flex" style={{ margin: "2vw" }}>
      <SearchBar inputRef={searchInputRef} onSearch={handleSearch} />
      <div className="flex-grow" />
      <RandomButton onClickRandom={handleRandomClick} />
      <ReferenceButton onClickReference={handleReferenceModalOpen} />
      <ModalButton onClickModal={handleMassModalToggle} isDisabled={isDisabled} />
    </div>
  );
};