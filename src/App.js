// -------------------- IMPORTS --------------------
// This section imports libraries, components, and files needed for this component
import React, { useState, useEffect } from 'react';
import {
  X,
  Menu,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  Edit,
  ChevronDown,
} from 'lucide-react';
import './App.css';
import { leadService, listService } from './firebase/leadService';

// -------------------- UTILITY FUNCTIONS --------------------
// Helper functions defined outside the component

// Helper function to format a date string from YYYY-MM-DD to MM/DD/YY
const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';

  // Parse the input date string (expected format: YYYY-MM-DD)
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString; // Return original if not in expected format

  const year = parts[0].substring(2); // Get last 2 digits of year
  const month = parts[1];
  const day = parts[2];

  return `${month}/${day}/${year}`;
};

// Helper function to convert from MM/DD/YY to YYYY-MM-DD for storage
const formatDateForStorage = (dateString) => {
  if (!dateString) return '';

  // Parse the input date string (expected format: MM/DD/YY)
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString; // Return original if not in expected format

  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  let year = parts[2];

  // Handle 2-digit years by assuming 20xx for simplicity
  if (year.length === 2) {
    year = `20${year}`;
  }

  return `${year}-${month}-${day}`;
};

// Get today's date in MM/DD/YY format
const getTodayFormatted = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = String(today.getFullYear()).substring(2);

  return `${month}/${day}/${year}`;
};

// New function to get date with timestamp
const getFormattedDateTime = () => {
  const now = new Date();

  // Format date (MM/DD/YY)
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = String(now.getFullYear()).substring(2);
  const date = `${month}/${day}/${year}`;

  // Format time (HH:MM AM/PM)
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const time = `${hours}:${minutes} ${ampm}`;

  return {
    date,
    time,
    formatted: `${date} ${time}`,
  };
};

// Get unique industries from leads
const getUniqueIndustries = (leads) => {
  const industries = new Set();
  leads.forEach((lead) => industries.add(lead.industry));
  return Array.from(industries);
};

// Helper function to get interest level sort order
const getInterestLevelWeight = (interestLevel) => {
  const weights = {
    Inactive: 0,
    Cold: 1,
    Warm: 2,
    Hot: 3,
    Converted: 4,
  };
  return weights[interestLevel] !== undefined ? weights[interestLevel] : -1;
};

// Helper function to get contact status color
const getContactStatusColor = (status) => {
  const colors = {
    'Initial Outreach': 'rgb(100, 116, 139)', // Now using the gray-blue color
    'In Discussion': 'rgb(234, 179, 8)',
    'Proposal Sent': 'rgb(168, 85, 247)',
    Negotiating: 'rgb(6, 182, 212)',
    'Under Review': 'rgb(59, 130, 246)',
    'Contract Sent': 'rgb(22, 101, 216)',
    'Future Opportunity': 'rgb(249, 115, 22)',
    Onboarding: 'rgb(16, 185, 129)',
    Maintenance: 'rgb(5, 150, 105)',
    Dormant: 'rgb(107, 114, 128)',
    Lost: 'rgb(220, 38, 38)',
    'Not Contacted': 'rgb(71, 85, 105)', // Now using the original Initial Outreach color
  };
  return colors[status] || 'rgb(71, 85, 105)'; // Default color if not found
};

// -------------------- INITIAL DATA --------------------
// Sample data or constants defined outside the component
// Sample data - in a real app, this would be stored in a database
const initialLeads = [
  {
    id: 1,
    businessName: 'Green Thumb Landscaping',
    contactPerson: 'John Smith',
    phone: '555-123-4567',
    email: 'john@greenthumb.com',
    website: 'https://greenthumb.com',
    socials: {
      facebook: 'https://facebook.com/greenthumb',
      instagram: 'https://instagram.com/greenthumb',
      linkedin: 'https://linkedin.com/company/greenthumb',
      gbp: 'https://maps.google.com/?cid=12345',
    },
    hasWebsite: true,
    interestLevel: 'Hot',
    industry: 'Landscaping',
    lastContactDate: '04/15/25',
    contactStatus: 'In Discussion', // Changed from 'Follow Up'
    contactMethods: ['phone', 'email'],
    notes: [
      {
        content:
          'Interested in a full website redesign. Will need to follow up next week about their budget.',
        date: '04/15/25',
        time: '2:30 PM',
        timestamp: '04/15/25 2:30 PM',
      },
    ],
  },
  {
    id: 2,
    businessName: 'City Brew Coffee',
    contactPerson: 'Lisa Johnson',
    phone: '555-987-6543',
    email: 'lisa@citybrew.com',
    website: 'https://citybrew.com',
    socials: {
      facebook: 'https://facebook.com/citybrew',
      instagram: 'https://instagram.com/citybrew',
      linkedin: null,
      gbp: 'https://maps.google.com/?cid=67890',
    },
    hasWebsite: true,
    interestLevel: 'Warm',
    industry: 'Bar/Restaurant/Brewery',
    lastContactDate: '04/10/25',
    contactStatus: 'Proposal Sent', // Changed from 'Waiting For Response'
    contactMethods: ['email'],
    notes: [
      {
        content:
          'Sent initial proposal. Waiting to hear back about timeline and budget considerations.',
        date: '04/10/25',
        time: '10:15 AM',
        timestamp: '04/10/25 10:15 AM',
      },
    ],
  },
  {
    id: 3,
    businessName: 'Johnson & Partners Law',
    contactPerson: 'Robert Johnson',
    phone: '555-456-7890',
    email: 'robert@johnsonlaw.com',
    website: null,
    socials: {
      facebook: 'https://facebook.com/johnsonlaw',
      instagram: null,
      linkedin: 'https://linkedin.com/company/johnsonlaw',
      gbp: 'https://maps.google.com/?cid=13579',
    },
    hasWebsite: false,
    interestLevel: 'Hot',
    industry: 'Law Firm',
    lastContactDate: '04/18/25',
    contactStatus: 'In Discussion', // Changed from 'Follow Up'
    contactMethods: ['phone'],
    notes: [
      {
        content:
          'Needs a website ASAP. Very interested in search engine optimization services too.',
        date: '04/18/25',
        time: '9:45 AM',
        timestamp: '04/18/25 9:45 AM',
      },
    ],
  },
  {
    id: 4,
    businessName: 'QuickFix Plumbing',
    contactPerson: 'Mike Wilson',
    phone: '555-789-0123',
    email: 'mike@quickfixplumbing.com',
    website: 'https://quickfixplumbing.com',
    socials: {
      facebook: 'https://facebook.com/quickfix',
      instagram: 'https://instagram.com/quickfix',
      linkedin: null,
      gbp: 'https://maps.google.com/?cid=24680',
    },
    hasWebsite: true,
    interestLevel: 'Inactive',
    industry: 'Plumbing',
    lastContactDate: '04/05/25',
    contactStatus: 'Initial Outreach', // Changed from 'Not Contacted'
    contactMethods: ['email', 'phone'],
    notes: [
      {
        content:
          "Has a website but it's outdated. Not actively pursuing changes at this time.",
        date: '04/05/25',
        time: '11:20 AM',
        timestamp: '04/05/25 11:20 AM',
      },
    ],
  },
  {
    id: 5,
    businessName: 'Fresh Eats Deli',
    contactPerson: 'Sarah Brown',
    phone: '555-321-6547',
    email: 'sarah@fresheats.com',
    website: 'https://fresheats.com',
    socials: {
      facebook: 'https://facebook.com/fresheats',
      instagram: 'https://instagram.com/fresheats',
      linkedin: null,
      gbp: 'https://maps.google.com/?cid=97531',
    },
    hasWebsite: true,
    interestLevel: 'Converted',
    industry: 'Bar/Restaurant/Brewery',
    lastContactDate: '04/12/25',
    contactStatus: 'Maintenance', // Changed from 'Waiting For Response'
    contactMethods: ['message'],
    notes: [
      {
        content: 'First contact made. Interested in our services.',
        date: '03/10/25',
        time: '9:00 AM',
        timestamp: '03/10/25 9:00 AM',
      },
      {
        content:
          'Website launched today. Client is very satisfied with the outcome.',
        date: '03/15/25',
        time: '3:45 PM',
        timestamp: '03/15/25 3:45 PM',
      },
      {
        content: 'Started monthly maintenance package.',
        date: '04/12/25',
        time: '10:30 AM',
        timestamp: '04/12/25 10:30 AM',
      },
    ],
  },
  {
    id: 6,
    businessName: 'Mountain View Landscaping',
    contactPerson: 'Thomas Reed',
    phone: '555-111-2222',
    email: 'thomas@mvlandscaping.com',
    website: null,
    socials: {
      facebook: 'https://facebook.com/mvlandscaping',
      instagram: 'https://instagram.com/mvlandscaping',
      linkedin: null,
      gbp: 'https://maps.google.com/?cid=11223',
    },
    hasWebsite: false,
    interestLevel: 'Warm',
    industry: 'Landscaping',
    lastContactDate: '04/20/25',
    contactStatus: 'Initial Outreach', // Changed from 'Not Contacted'
    contactMethods: [],
    notes: [
      {
        content:
          'Found via Facebook. Looking to establish an online presence for the first time.',
        date: '04/20/25',
        time: '1:15 PM',
        timestamp: '04/20/25 1:15 PM',
      },
    ],
  },
];

// -------------------- COMPONENT DEFINITION --------------------
// Lead tracking app component
const App = () => {
  // -------------------- STATE DECLARATIONS --------------------
  // All useState hooks to manage component state
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [customLists, setCustomLists] = useState([]);
  const [selectedList, setSelectedList] = useState('All Leads');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Add the new state variables here
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    socials: {
      facebook: '',
      instagram: '',
      linkedin: '',
      gbp: '',
    },
    hasWebsite: false,
    interestLevel: 'Cold',
    industry: '',
    lastContactDate: getTodayFormatted(),
    contactStatus: 'Initial Outreach', // Changed from 'Not Contacted'
    contactMethods: [],
    notes: [], // Changed from string to array
  });
  // New state for current note being composed
  const [currentNote, setCurrentNote] = useState('');

  // New list form state
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListType, setNewListType] = useState('interestLevel');
  const [newListValue, setNewListValue] = useState('Cold');
  // Industry form state
  const [showNewIndustryForm, setShowNewIndustryForm] = useState(false);
  const [newIndustry, setNewIndustry] = useState('');
  // Edit leads
  const [showEditLeadForm, setShowEditLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  // State for edit form current note
  const [editingCurrentNote, setEditingCurrentNote] = useState('');
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState({});
  // Rows details slide animation
  // Add this to your state declarations
  const [animatingRows, setAnimatingRows] = useState({});

  // -------------------- EFFECT HOOKS --------------------
  // useEffect hooks for side effects
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768 && sidebarVisible) {
        setSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarVisible]);

  // Sort leads when sort config changes
  useEffect(() => {
    let sortedLeads = [...leads];
    if (sortConfig.key) {
      sortedLeads.sort((a, b) => {
        // Special handling for interest level sorting
        if (sortConfig.key === 'interestLevel') {
          const weightA = getInterestLevelWeight(a.interestLevel);
          const weightB = getInterestLevelWeight(b.interestLevel);

          if (sortConfig.direction === 'ascending') {
            return weightA - weightB;
          } else {
            return weightB - weightA;
          }
        }

        // Special handling for date sorting
        if (sortConfig.key === 'lastContactDate') {
          // Convert MM/DD/YY to Date objects for comparison
          const dateA = a[sortConfig.key].split('/');
          const dateB = b[sortConfig.key].split('/');

          if (dateA.length === 3 && dateB.length === 3) {
            // Create date objects (assuming 20xx for 2-digit years)
            const yearA = dateA[2].length === 2 ? `20${dateA[2]}` : dateA[2];
            const yearB = dateB[2].length === 2 ? `20${dateB[2]}` : dateB[2];

            const dateObjA = new Date(yearA, parseInt(dateA[0]) - 1, dateA[1]);
            const dateObjB = new Date(yearB, parseInt(dateB[0]) - 1, dateB[1]);

            if (sortConfig.direction === 'ascending') {
              return dateObjA - dateObjB;
            } else {
              return dateObjB - dateObjA;
            }
          }
        }

        // Default sorting for non-date fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredLeads(sortedLeads);
  }, [leads, sortConfig]);

  // Filter leads when selection changes
  useEffect(() => {
    let filtered = [...leads];

    // Filter by industry
    if (selectedIndustry !== 'All') {
      filtered = filtered.filter((lead) => lead.industry === selectedIndustry);
    }

    // Filter by custom list
    if (selectedList !== 'All Leads') {
      const list = customLists.find((list) => list.name === selectedList);
      if (list) {
        filtered = filtered.filter(list.filter);
      }
    }

    setFilteredLeads(filtered);
  }, [leads, selectedIndustry, selectedList, customLists]);

  // Add this to your EFFECT HOOKS section
  useEffect(() => {
    // Add click event listener to document for handling outside clicks
    const handleDocumentClick = (e) => {
      // Loop through all expanded rows
      Object.keys(expandedRows).forEach((id) => {
        if (expandedRows[id]) {
          handleClickOutside(e, id);
        }
      });
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [expandedRows]);

  // Fetch leads from Firebase on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const leadData = await leadService.getLeads();
        setLeads(leadData);
        setFilteredLeads(leadData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Helper function to create filter functions based on stored criteria
  const createFilterFunction = (filterType, filterValue) => {
    switch (filterType) {
      case 'interestLevel':
        return (lead) => lead.interestLevel === filterValue;
      case 'contactStatus':
        return (lead) => lead.contactStatus === filterValue;
      case 'industry':
        return (lead) => lead.industry === filterValue;
      case 'hasWebsite':
        return (lead) => lead.hasWebsite === filterValue;
      default:
        return () => true;
    }
  };

  // Fetch custom lists from Firebase on component mount
  useEffect(() => {
    const fetchCustomLists = async () => {
      try {
        // Get all existing lists
        const listData = await listService.getLists();

        // Delete all existing lists first
        await Promise.all(
          listData.map((list) => listService.deleteList(list.id))
        );

        // Define only the specific default lists you want
        const defaultListsConfig = [
          {
            name: 'Cold Leads',
            filterType: 'interestLevel',
            filterValue: 'Cold',
          },
          {
            name: 'Warm Leads',
            filterType: 'interestLevel',
            filterValue: 'Warm',
          },
          {
            name: 'Hot Leads',
            filterType: 'interestLevel',
            filterValue: 'Hot',
          },
          {
            name: 'Converted Leads',
            filterType: 'interestLevel',
            filterValue: 'Converted',
          },
          {
            name: 'Inactive Leads',
            filterType: 'interestLevel',
            filterValue: 'Inactive',
          },
        ];

        // Create the new lists
        const savedLists = await Promise.all(
          defaultListsConfig.map((list) => listService.addList(list))
        );

        // Transform lists to include filter functions
        const listsWithFilters = savedLists.map((list) => ({
          ...list,
          filter: createFilterFunction(list.filterType, list.filterValue),
        }));

        setCustomLists(listsWithFilters);
      } catch (error) {
        console.error('Error managing custom lists:', error);
      }
    };

    fetchCustomLists();
  }, []);

  // -------------------- EVENT HANDLERS & LOGIC FUNCTIONS --------------------
  // Functions that handle user interactions and data manipulation
  // Request sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Toggle contact method with Firebase
  const toggleContactMethod = async (id, method) => {
    try {
      const leadToUpdate = leads.find((lead) => lead.id === id);

      if (leadToUpdate) {
        const methods = [...leadToUpdate.contactMethods];
        let newMethods;
        let lastContactDate = leadToUpdate.lastContactDate;

        // If method already exists, remove it (toggle off)
        if (methods.includes(method)) {
          newMethods = methods.filter((m) => m !== method);
        } else {
          // Otherwise, add it (toggle on)
          newMethods = [...methods, method];
          lastContactDate = getTodayFormatted(); // Update to today's date
        }

        await leadService.updateLead(id, {
          contactMethods: newMethods,
          lastContactDate,
        });

        const updatedLeads = leads.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              contactMethods: newMethods,
              lastContactDate,
            };
          }
          return lead;
        });

        setLeads(updatedLeads);
      }
    } catch (error) {
      console.error('Error updating contact methods:', error);
    }
  };

  // Update interest level
  // Update interest level with Firebase
  const updateInterestLevel = async (id, level) => {
    try {
      const leadToUpdate = leads.find((lead) => lead.id === id);
      if (leadToUpdate) {
        await leadService.updateLead(id, { interestLevel: level });

        const updatedLeads = leads.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              interestLevel: level,
            };
          }
          return lead;
        });

        setLeads(updatedLeads);
      }
    } catch (error) {
      console.error('Error updating interest level:', error);
    }
  };

  // Update contact status
  // Update contact status with Firebase
  const updateContactStatus = async (id, status) => {
    try {
      const leadToUpdate = leads.find((lead) => lead.id === id);
      if (leadToUpdate) {
        await leadService.updateLead(id, { contactStatus: status });

        const updatedLeads = leads.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              contactStatus: status,
            };
          }
          return lead;
        });

        setLeads(updatedLeads);
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  // Count leads in list
  const countLeadsInList = (listName) => {
    if (listName === 'All Leads') {
      return leads.length;
    }

    const list = customLists.find((list) => list.name === listName);
    if (list) {
      return leads.filter(list.filter).length;
    }

    return 0;
  };

  // Count leads in industry
  const countLeadsInIndustry = (industry) => {
    if (industry === 'All') {
      return leads.length;
    }
    return leads.filter((lead) => lead.industry === industry).length;
  };

  // Handle add lead with Firebase
  const handleAddLead = async () => {
    try {
      const newLeadWithId = {
        ...newLead,
        hasWebsite: !!newLead.website,
      };

      const savedLead = await leadService.addLead(newLeadWithId);
      setLeads([...leads, savedLead]);
      setShowNewLeadForm(false);
      setNewLead({
        businessName: '',
        contactPerson: '',
        phone: '',
        email: '',
        website: '',
        socials: {
          facebook: '',
          instagram: '',
          linkedin: '',
          gbp: '',
        },
        hasWebsite: false,
        interestLevel: 'Cold',
        industry: '',
        lastContactDate: getTodayFormatted(),
        contactStatus: 'Initial Outreach',
        contactMethods: [],
        notes: [],
      });
      setCurrentNote('');
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  // Handle input changes for new lead form
  const handleNewLeadChange = (e) => {
    const { name, value } = e.target;

    if (name === 'currentNote') {
      setCurrentNote(value);
      return;
    }

    if (name.includes('socials.')) {
      const socialType = name.split('.')[1];
      setNewLead({
        ...newLead,
        socials: {
          ...newLead.socials,
          [socialType]: value,
        },
      });
    } else {
      setNewLead({
        ...newLead,
        [name]: value,
      });
    }
  };

  // Handle adding a new note with timestamp
  const handleAddNote = (isEditForm = false) => {
    const noteText = isEditForm ? editingCurrentNote : currentNote;

    if (!noteText.trim()) return; // Don't add empty notes

    const timestamp = getFormattedDateTime();
    const newNote = {
      content: noteText.trim(),
      date: timestamp.date,
      time: timestamp.time,
      timestamp: timestamp.formatted,
    };

    if (isEditForm) {
      setEditingLead({
        ...editingLead,
        notes: [newNote, ...editingLead.notes],
      });
      setEditingCurrentNote('');
    } else {
      setNewLead({
        ...newLead,
        notes: [newNote, ...newLead.notes],
      });
      setCurrentNote('');
    }
  };

  // Handle deleting a note
  const handleDeleteNote = (index, isEditForm = false) => {
    if (isEditForm) {
      const updatedNotes = [...editingLead.notes];
      updatedNotes.splice(index, 1);
      setEditingLead({
        ...editingLead,
        notes: updatedNotes,
      });
    } else {
      const updatedNotes = [...newLead.notes];
      updatedNotes.splice(index, 1);
      setNewLead({
        ...newLead,
        notes: updatedNotes,
      });
    }
  };

  // Then replace your existing functions with these:

  // Toggle row expansion with animation
  const toggleRowExpansion = (id, event) => {
    // Return early if the click was on an interactive element or its children
    // This will prevent row expansion when clicking on form controls or links
    if (
      event &&
      (event.target.closest('select') ||
        event.target.closest('button') ||
        event.target.closest('a') ||
        event.target.closest('.contact-info') ||
        event.target.closest('.website-status') ||
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'SELECT' ||
        event.target.tagName === 'BUTTON' ||
        event.target.tagName === 'A')
    ) {
      return;
    }

    // Also prevent expansion when user is trying to select text
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      return;
    }

    // Prevent toggling if clicking within the expanded content
    if (event && event.target.closest(`.expanded-content`)) {
      return;
    }

    if (expandedRows[id]) {
      // Closing - first trigger animation, then hide
      setAnimatingRows((prev) => ({ ...prev, [id]: false }));

      // Wait for animation to complete before removing from DOM
      setTimeout(() => {
        setExpandedRows((prev) => ({ ...prev, [id]: false }));
      }, 300); // Match this to your transition duration
    } else {
      // Opening - first show, then animate
      setExpandedRows((prev) => ({ ...prev, [id]: true }));

      // Need a small delay to ensure the DOM is updated before animation starts
      setTimeout(() => {
        setAnimatingRows((prev) => ({ ...prev, [id]: true }));
      }, 10);
    }
  };

  // Handle click outside expanded row
  const handleClickOutside = (e, id) => {
    // Only close if:
    // 1. The row is currently expanded
    // 2. The click is outside the expanded content
    // 3. The click is not on the row itself (which would toggle it via onClick)
    if (
      expandedRows[id] &&
      !e.target.closest(`.expanded-content`) &&
      !e.target.closest(`tr[data-id="${id}"]`)
    ) {
      // Use the same animation sequence as in toggleRowExpansion
      setAnimatingRows((prev) => ({ ...prev, [id]: false }));

      setTimeout(() => {
        setExpandedRows((prev) => ({ ...prev, [id]: false }));
      }, 300);
    }
  };

  // Handle date input (to ensure consistent MM/DD/YY format)
  const handleDateChange = (e, isEditForm = false) => {
    const { name, value } = e.target;

    // Basic validation for MM/DD/YY format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{2}$/;

    // If the input doesn't match the regex but is not empty, don't update
    if (value && !dateRegex.test(value) && value.length === 8) {
      return;
    }

    if (isEditForm) {
      setEditingLead({
        ...editingLead,
        [name]: value,
      });
    } else {
      setNewLead({
        ...newLead,
        [name]: value,
      });
    }
  };

  // Add a new custom list
  // Add a custom list with Firebase
  const handleAddList = async () => {
    try {
      let filterType = newListType;
      let filterValue = newListValue;

      // For hasWebsite, convert string to boolean
      if (newListType === 'hasWebsite') {
        filterValue = newListValue === 'true';
      }

      const newCustomList = {
        name: newListName,
        filterType,
        filterValue,
      };

      const savedList = await listService.addList(newCustomList);

      // Add the filter function
      const listWithFilter = {
        ...savedList,
        filter: createFilterFunction(filterType, filterValue),
      };

      setCustomLists([...customLists, listWithFilter]);
      setShowNewListForm(false);
      setNewListName('');
      setNewListType('interestLevel');
      setNewListValue('Cold');
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  // Delete a custom list
  // Delete a custom list with Firebase
  const deleteCustomList = async (listName) => {
    try {
      const listToDelete = customLists.find((list) => list.name === listName);

      if (listToDelete) {
        await listService.deleteList(listToDelete.id);
        setCustomLists(customLists.filter((list) => list.name !== listName));

        if (selectedList === listName) {
          setSelectedList('All Leads');
        }
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  // Add a new industry
  const handleAddIndustry = () => {
    if (newIndustry && !industries.includes(newIndustry)) {
      // Create a new lead with this industry to ensure it persists
      const timestamp = getFormattedDateTime();
      const newLeadWithIndustry = {
        id:
          leads.length > 0 ? Math.max(...leads.map((lead) => lead.id)) + 1 : 1,
        businessName: `Sample ${newIndustry}`,
        contactPerson: '',
        phone: '',
        email: '',
        website: '',
        socials: {
          facebook: '',
          instagram: '',
          linkedin: '',
          gbp: '',
        },
        hasWebsite: false,
        interestLevel: 'Cold',
        industry: newIndustry,
        lastContactDate: getTodayFormatted(),
        contactStatus: 'Not Contacted',
        contactMethods: [],
        notes: [
          {
            content: `Sample lead for the ${newIndustry} industry.`,
            date: timestamp.date,
            time: timestamp.time,
            timestamp: timestamp.formatted,
          },
        ],
      };

      setLeads([...leads, newLeadWithIndustry]);
      setShowNewIndustryForm(false);
      setNewIndustry('');
    }
  };

  // Handle opening edit form for a lead
  const handleEditLead = (lead) => {
    setEditingLead({ ...lead });
    setShowEditLeadForm(true);
    setEditingCurrentNote('');
  };

  // Save the edited lead
  // Handle save edited lead with Firebase
  const handleSaveEditedLead = async () => {
    try {
      const updatedLead = {
        ...editingLead,
        hasWebsite: !!editingLead.website,
      };

      // Remove the id from the document to update (Firebase doesn't want the id in the document data)
      const { id, ...leadData } = updatedLead;

      await leadService.updateLead(id, leadData);

      const updatedLeads = leads.map((lead) =>
        lead.id === id ? updatedLead : lead
      );

      setLeads(updatedLeads);
      setShowEditLeadForm(false);
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  // Delete a lead
  // Handle delete lead with Firebase
  const handleDeleteLead = async (id) => {
    // Ask for confirmation before deleting
    if (
      window.confirm(
        'Are you sure you want to delete this lead? This action cannot be undone.'
      )
    ) {
      try {
        await leadService.deleteLead(id);
        const updatedLeads = leads.filter((lead) => lead.id !== id);
        setLeads(updatedLeads);
        setShowEditLeadForm(false);
        setEditingLead(null);
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  // Handle input changes for edit form
  const handleEditLeadChange = (e) => {
    const { name, value } = e.target;

    if (name === 'currentNote') {
      setEditingCurrentNote(value);
      return;
    }

    if (name.includes('socials.')) {
      const socialType = name.split('.')[1];
      setEditingLead({
        ...editingLead,
        socials: {
          ...editingLead.socials,
          [socialType]: value,
        },
      });
    } else {
      setEditingLead({
        ...editingLead,
        [name]: value,
      });
    }
  };

  // Handle copying text to clipboard with visual feedback
  const copyToClipboard = (text, event) => {
    // Copy the text
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Add visual feedback
        const element = event.currentTarget;
        const tooltip = element.querySelector('.copy-tooltip');

        // Change the tooltip text and element background
        tooltip.textContent = 'Copied!';
        element.classList.add('copied');

        // Reset after a delay
        setTimeout(() => {
          tooltip.textContent = 'Click to copy';
          element.classList.remove('copied');
        }, 1500);
      })
      .catch((err) => {
        console.error('Error copying text: ', err);
      });
  };

  // -------------------- COMPUTED VALUES --------------------
  // Values derived from state
  // Get unique industries
  const industries = ['All', ...getUniqueIndustries(leads)];

  // -------------------- JSX/RENDER SECTION --------------------
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <div className="sidebar-content">
          <h2 className="sidebar-title">Lead Categories</h2>

          <div className="sidebar-section">
            <div className="section-header">
              <h3 className="section-title">Lists</h3>
              <button
                className="add-list-button"
                onClick={() => setShowNewListForm(true)}>
                + New
              </button>
            </div>
            <ul>
              <li
                className={`list-item ${
                  selectedList === 'All Leads' ? 'selected' : ''
                }`}
                onClick={() => setSelectedList('All Leads')}>
                <span className="list-name">
                  All Leads ({countLeadsInList('All Leads')})
                </span>
              </li>
              {customLists.map((list, index) => (
                <li
                  key={index}
                  className={`list-item ${
                    selectedList === list.name ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedList(list.name)}>
                  <span className="list-name">
                    {list.name} ({countLeadsInList(list.name)})
                  </span>
                  <button
                    className="delete-list-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from bubbling to li
                      deleteCustomList(list.name);
                    }}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-section">
            <div className="section-header">
              <h3 className="section-title">Industries</h3>
              <button
                className="add-list-button"
                onClick={() => setShowNewIndustryForm(true)}>
                + New
              </button>
            </div>
            <ul>
              {industries.map((industry, index) => (
                <li
                  key={index}
                  className={`list-item ${
                    selectedIndustry === industry ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedIndustry(industry);
                    setSelectedList('All Leads');
                  }}>
                  <span className="list-name">
                    {industry} ({countLeadsInIndustry(industry)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <button className="menu-button" onClick={toggleSidebar}>
            {sidebarVisible ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="app-title">Lead Tracker</h1>
          <button
            className="add-lead-button"
            onClick={() => setShowNewLeadForm(true)}>
            + Add New Lead
          </button>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead className="table-header">
              <tr>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('businessName')}>
                  Business Name
                  {sortConfig.key === 'businessName' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('contactPerson')}>
                  Contact Person
                  {sortConfig.key === 'contactPerson' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th className="table-cell">Contact Info</th>
                <th className="table-cell">Website</th>
                <th className="table-cell">Social</th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('interestLevel')}>
                  Interest Level
                  {sortConfig.key === 'interestLevel' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('industry')}>
                  Industry
                  {sortConfig.key === 'industry' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('lastContactDate')}>
                  Last Contact
                  {sortConfig.key === 'lastContactDate' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th
                  className="table-cell cursor-pointer"
                  onClick={() => requestSort('contactStatus')}>
                  Contact Status
                  {sortConfig.key === 'contactStatus' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      <ChevronDown size={12} />
                    </span>
                  )}
                </th>
                <th className="table-cell">Contact Methods</th>
                <th className="table-cell">Edit/Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr
                    className={`table-row ${
                      lead.interestLevel === 'Converted' ? 'converted' : ''
                    } ${expandedRows[lead.id] ? 'row-expanded' : ''}`}
                    data-id={lead.id}
                    onClick={(e) => toggleRowExpansion(lead.id, e)}
                    style={{ cursor: 'pointer' }}>
                    <td className="table-cell">{lead.businessName}</td>
                    <td className="table-cell">{lead.contactPerson}</td>
                    <td className="table-cell">
                      <div
                        className="contact-info"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row expansion
                          copyToClipboard(lead.phone, e);
                        }}>
                        {lead.phone}
                        <span className="copy-tooltip">Click to copy</span>
                      </div>
                      <div
                        className="contact-info"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row expansion
                          copyToClipboard(lead.email, e);
                        }}>
                        {lead.email}
                        <span className="copy-tooltip">Click to copy</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {lead.hasWebsite ? (
                        <a
                          href={
                            lead.website &&
                            (lead.website.startsWith('http://') ||
                              lead.website.startsWith('https://'))
                              ? lead.website
                              : `https://${lead.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`website-status has-website clickable-website`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            !lead.website && e.preventDefault();
                          }}
                          title={lead.website || 'No website URL provided'}>
                          Has Website{' '}
                          <ExternalLink size={14} className="inline-icon" />
                        </a>
                      ) : (
                        <div className="website-status no-website">
                          No Website
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="social-links">
                        {lead.socials.facebook && (
                          <a
                            href={lead.socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            onClick={(e) => e.stopPropagation()}>
                            <Facebook size={20} />
                          </a>
                        )}
                        {lead.socials.instagram && (
                          <a
                            href={lead.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            onClick={(e) => e.stopPropagation()}>
                            <Instagram size={20} />
                          </a>
                        )}
                        {lead.socials.linkedin && (
                          <a
                            href={lead.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            onClick={(e) => e.stopPropagation()}>
                            <Linkedin size={20} />
                          </a>
                        )}
                        {lead.socials.gbp && (
                          <a
                            href={lead.socials.gbp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            onClick={(e) => e.stopPropagation()}>
                            <MapPin size={20} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <select
                        className="interest-select"
                        value={lead.interestLevel}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent row expansion
                          updateInterestLevel(lead.id, e.target.value);
                        }}
                        style={{
                          backgroundColor:
                            lead.interestLevel === 'Hot'
                              ? 'rgb(22, 163, 74)'
                              : lead.interestLevel === 'Warm'
                              ? 'rgb(234, 179, 8)'
                              : lead.interestLevel === 'Cold'
                              ? 'rgb(59, 130, 246)'
                              : lead.interestLevel === 'Converted'
                              ? 'rgb(6, 182, 212)'
                              : 'rgb(220, 38, 38)',
                        }}>
                        <option
                          value="Cold"
                          style={{ backgroundColor: 'rgb(59, 130, 246)' }}>
                          Cold
                        </option>
                        <option
                          value="Warm"
                          style={{ backgroundColor: 'rgb(234, 179, 8)' }}>
                          Warm
                        </option>
                        <option
                          value="Hot"
                          style={{ backgroundColor: 'rgb(22, 163, 74)' }}>
                          Hot
                        </option>
                        <option
                          value="Converted"
                          style={{ backgroundColor: 'rgb(6, 182, 212)' }}>
                          Converted
                        </option>
                        <option
                          value="Inactive"
                          style={{ backgroundColor: 'rgb(220, 38, 38)' }}>
                          Inactive
                        </option>
                      </select>
                    </td>
                    <td className="table-cell">{lead.industry}</td>
                    <td className="table-cell">{lead.lastContactDate}</td>
                    <td className="table-cell">
                      <select
                        className="contact-status-select"
                        value={lead.contactStatus}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent row expansion
                          updateContactStatus(lead.id, e.target.value);
                        }}
                        style={{
                          backgroundColor: getContactStatusColor(
                            lead.contactStatus
                          ),
                        }}>
                        <option value="Initial Outreach">
                          Initial Outreach
                        </option>
                        <option value="Not Contacted">Not Contacted</option>
                        <option value="In Discussion">In Discussion</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Contract Sent">Contract Sent</option>
                        <option value="Future Opportunity">
                          Future Opportunity
                        </option>
                        <option value="Onboarding">Onboarding</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Dormant">Dormant</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <div className="contact-methods">
                        <button
                          className={`contact-button ${
                            lead.contactMethods.includes('phone')
                              ? 'contacted'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            toggleContactMethod(lead.id, 'phone');
                          }}
                          title="Phone Call">
                          <Phone size={16} />
                        </button>
                        <button
                          className={`contact-button ${
                            lead.contactMethods.includes('message')
                              ? 'contacted'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            toggleContactMethod(lead.id, 'message');
                          }}
                          title="Text Message">
                          <MessageSquare size={16} />
                        </button>
                        <button
                          className={`contact-button ${
                            lead.contactMethods.includes('email')
                              ? 'contacted'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            toggleContactMethod(lead.id, 'email');
                          }}
                          title="Email">
                          <Mail size={16} />
                        </button>
                        <button
                          className={`contact-button ${
                            lead.contactMethods.includes('facebook')
                              ? 'contacted'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            toggleContactMethod(lead.id, 'facebook');
                          }}
                          title="Facebook Message">
                          <Facebook size={16} />
                        </button>
                        <button
                          className={`contact-button ${
                            lead.contactMethods.includes('instagram')
                              ? 'contacted'
                              : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row expansion
                            toggleContactMethod(lead.id, 'instagram');
                          }}
                          title="Instagram Message">
                          <Instagram size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row expansion
                          handleEditLead(lead);
                        }}
                        title="Edit Lead">
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedRows[lead.id] && (
                    <tr className={`expanded-row expanded-row-${lead.id}`}>
                      <td colSpan="11">
                        <div
                          className={`expanded-content ${
                            animatingRows[lead.id] ? 'animating' : ''
                          }`}
                          onClick={(e) => e.stopPropagation()}>
                          <div className="expanded-notes">
                            <h4>Notes</h4>
                            {lead.notes.length > 0 ? (
                              <ul className="notes-list expanded-notes-list">
                                {lead.notes.map((note, index) => (
                                  <li key={index} className="note-item">
                                    <div className="note-header">
                                      <span className="note-date">
                                        {note.timestamp}
                                      </span>
                                    </div>
                                    <div className="note-content">
                                      {note.content}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>No notes available for this lead.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Lead</h2>
              <button
                className="close-button"
                onClick={() => setShowNewLeadForm(false)}>
                ×
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={newLead.businessName}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={newLead.contactPerson}
                  onChange={handleNewLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={newLead.phone}
                  onChange={handleNewLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newLead.email}
                  onChange={handleNewLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={newLead.website}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={newLead.industry}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  list="industries"
                  required
                />
                <datalist id="industries">
                  {industries
                    .filter((i) => i !== 'All')
                    .map((industry, index) => (
                      <option key={index} value={industry} />
                    ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Interest Level</label>
                <select
                  name="interestLevel"
                  value={newLead.interestLevel}
                  onChange={handleNewLeadChange}
                  className="form-input">
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                  <option value="Converted">Converted</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Last Contact Date (MM/DD/YY)</label>
                <input
                  type="text"
                  name="lastContactDate"
                  value={newLead.lastContactDate}
                  onChange={(e) => handleDateChange(e)}
                  className="form-input"
                  placeholder="MM/DD/YY"
                  maxLength="8"
                />
              </div>

              <div className="form-group">
                <label>Contact Status</label>
                <select
                  name="contactStatus"
                  value={newLead.contactStatus}
                  onChange={handleNewLeadChange}
                  className="form-input">
                  <option value="Initial Outreach">Initial Outreach</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Contract Sent">Contract Sent</option>
                  <option value="Future Opportunity">Future Opportunity</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Dormant">Dormant</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            <h3>Social Media</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  name="socials.facebook"
                  value={newLead.socials.facebook}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  placeholder="https://facebook.com/business"
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  name="socials.instagram"
                  value={newLead.socials.instagram}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  placeholder="https://instagram.com/business"
                />
              </div>

              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="socials.linkedin"
                  value={newLead.socials.linkedin}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  placeholder="https://linkedin.com/company/business"
                />
              </div>

              <div className="form-group">
                <label>Google Business Profile</label>
                <input
                  type="url"
                  name="socials.gbp"
                  value={newLead.socials.gbp}
                  onChange={handleNewLeadChange}
                  className="form-input"
                  placeholder="https://maps.google.com/?cid=12345"
                />
              </div>
            </div>

            {/* Notes Section */}
            <h3>Notes</h3>
            <div className="form-group notes-input">
              <div className="notes-add-section">
                <textarea
                  name="currentNote"
                  value={currentNote}
                  onChange={handleNewLeadChange}
                  className="form-input notes-textarea"
                  placeholder="Add a new note..."
                  rows="3"
                />
                <button
                  className="submit-button notes-add-button"
                  onClick={() => handleAddNote(false)}
                  disabled={!currentNote.trim()}>
                  Add Note
                </button>
              </div>

              {newLead.notes.length > 0 && (
                <div className="notes-history">
                  <h4>Notes History</h4>
                  <ul className="notes-list">
                    {newLead.notes.map((note, index) => (
                      <li key={index} className="note-item">
                        <div className="note-header">
                          <span className="note-date">{note.timestamp}</span>
                          <button
                            className="delete-note-button"
                            onClick={() => handleDeleteNote(index, false)}
                            title="Delete note">
                            ×
                          </button>
                        </div>
                        <div className="note-content">{note.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowNewLeadForm(false)}>
                Cancel
              </button>
              <button className="submit-button" onClick={handleAddLead}>
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New List Form Modal */}
      {showNewListForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New List</h2>
              <button
                className="close-button"
                onClick={() => setShowNewListForm(false)}>
                ×
              </button>
            </div>

            <div className="form-group">
              <label>List Name</label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="form-input"
                placeholder="My Custom List"
                required
              />
            </div>

            <div className="form-group">
              <label>Filter Type</label>
              <select
                value={newListType}
                onChange={(e) => setNewListType(e.target.value)}
                className="form-input">
                <option value="interestLevel">Interest Level</option>
                <option value="contactStatus">Contact Status</option>
                <option value="industry">Industry</option>
                <option value="hasWebsite">Has Website</option>
              </select>
            </div>

            <div className="form-group">
              <label>Filter Value</label>
              {newListType === 'interestLevel' && (
                <select
                  value={newListValue}
                  onChange={(e) => setNewListValue(e.target.value)}
                  className="form-input">
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                  <option value="Converted">Converted</option>
                  <option value="Inactive">Inactive</option>
                </select>
              )}

              {newListType === 'contactStatus' && (
                <select
                  value={newListValue}
                  onChange={(e) => setNewListValue(e.target.value)}
                  className="form-input">
                  <option value="Initial Outreach">Initial Outreach</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Contract Sent">Contract Sent</option>
                  <option value="Future Opportunity">Future Opportunity</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Dormant">Dormant</option>
                  <option value="Lost">Lost</option>
                </select>
              )}

              {newListType === 'industry' && (
                <select
                  value={newListValue}
                  onChange={(e) => setNewListValue(e.target.value)}
                  className="form-input">
                  {industries
                    .filter((i) => i !== 'All')
                    .map((industry, index) => (
                      <option key={index} value={industry}>
                        {industry}
                      </option>
                    ))}
                </select>
              )}

              {newListType === 'hasWebsite' && (
                <select
                  value={newListValue}
                  onChange={(e) => setNewListValue(e.target.value)}
                  className="form-input">
                  <option value="true">Has Website</option>
                  <option value="false">No Website</option>
                </select>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowNewListForm(false)}>
                Cancel
              </button>
              <button className="submit-button" onClick={handleAddList}>
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Industry Form Modal */}
      {showNewIndustryForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Industry</h2>
              <button
                className="close-button"
                onClick={() => setShowNewIndustryForm(false)}>
                ×
              </button>
            </div>

            <div className="form-group">
              <label>Industry Name</label>
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                className="form-input"
                placeholder="New Industry"
                required
              />
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowNewIndustryForm(false)}>
                Cancel
              </button>
              <button className="submit-button" onClick={handleAddIndustry}>
                Add Industry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Form Modal */}
      {showEditLeadForm && editingLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Lead</h2>
              <button
                className="close-button"
                onClick={() => setShowEditLeadForm(false)}>
                ×
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={editingLead.businessName}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={editingLead.contactPerson}
                  onChange={handleEditLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editingLead.phone}
                  onChange={handleEditLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editingLead.email}
                  onChange={handleEditLeadChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={editingLead.website || ''}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={editingLead.industry}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  list="industries"
                  required
                />
                <datalist id="industries">
                  {industries
                    .filter((i) => i !== 'All')
                    .map((industry, index) => (
                      <option key={index} value={industry} />
                    ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Interest Level</label>
                <select
                  name="interestLevel"
                  value={editingLead.interestLevel}
                  onChange={handleEditLeadChange}
                  className="form-input">
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                  <option value="Converted">Converted</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Last Contact Date (MM/DD/YY)</label>
                <input
                  type="text"
                  name="lastContactDate"
                  value={editingLead.lastContactDate}
                  onChange={(e) => handleDateChange(e, true)}
                  className="form-input"
                  placeholder="MM/DD/YY"
                  maxLength="8"
                />
              </div>

              <div className="form-group">
                <label>Contact Status</label>
                <select
                  name="contactStatus"
                  value={editingLead.contactStatus}
                  onChange={handleEditLeadChange}
                  className="form-input">
                  <option value="Initial Outreach">Initial Outreach</option>
                  <option value="In Discussion">In Discussion</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiating">Negotiating</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Contract Sent">Contract Sent</option>
                  <option value="Future Opportunity">Future Opportunity</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Dormant">Dormant</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            <h3>Social Media</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  name="socials.facebook"
                  value={editingLead.socials.facebook || ''}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  placeholder="https://facebook.com/business"
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="url"
                  name="socials.instagram"
                  value={editingLead.socials.instagram || ''}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  placeholder="https://instagram.com/business"
                />
              </div>

              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="socials.linkedin"
                  value={editingLead.socials.linkedin || ''}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  placeholder="https://linkedin.com/company/business"
                />
              </div>

              <div className="form-group">
                <label>Google Business Profile</label>
                <input
                  type="url"
                  name="socials.gbp"
                  value={editingLead.socials.gbp || ''}
                  onChange={handleEditLeadChange}
                  className="form-input"
                  placeholder="https://maps.google.com/?cid=12345"
                />
              </div>
            </div>

            {/* Notes Section */}
            <h3>Notes</h3>
            <div className="form-group notes-input">
              <div className="notes-add-section">
                <textarea
                  name="currentNote"
                  value={editingCurrentNote}
                  onChange={handleEditLeadChange}
                  className="form-input notes-textarea"
                  placeholder="Add a new note..."
                  rows="3"
                />
                <button
                  className="submit-button notes-add-button"
                  onClick={() => handleAddNote(true)}
                  disabled={!editingCurrentNote.trim()}>
                  Add Note
                </button>
              </div>

              {editingLead.notes.length > 0 && (
                <div className="notes-history">
                  <h4>Notes History</h4>
                  <ul className="notes-list">
                    {editingLead.notes.map((note, index) => (
                      <li key={index} className="note-item">
                        <div className="note-header">
                          <span className="note-date">{note.timestamp}</span>
                          <button
                            className="delete-note-button"
                            onClick={() => handleDeleteNote(index, true)}
                            title="Delete note">
                            ×
                          </button>
                        </div>
                        <div className="note-content">{note.content}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="delete-lead-button"
                onClick={() => handleDeleteLead(editingLead.id)}>
                Delete Lead
              </button>
              <div className="right-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setShowEditLeadForm(false)}>
                  Cancel
                </button>
                <button
                  className="submit-button"
                  onClick={handleSaveEditedLead}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------- COMPONENT EXPORT --------------------
export default App;
